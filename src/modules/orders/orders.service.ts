import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { CartItem } from '../carts/entities/cart-item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductSku } from '../products/entities/product-sku.entity';
import { Product } from '../products/entities/product.entity';
import { ShippingAddress } from '../shipping-addresses/entities/shipping-address.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly productSkusRepository: Repository<ProductSku>,
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressesRepository: Repository<ShippingAddress>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: number, queryDto: QueryOrdersDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: FindOptionsWhere<Order> = { user: { id: userId } };

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    const [list, total] = await this.ordersRepository.findAndCount({
      where,
      relations: {
        user: true,
        items: {
          product: true,
          sku: true,
        },
      },
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    this.ensureOrderSourceProvided(createOrderDto);

    const shippingAddress = await this.shippingAddressesRepository.findOne({
      where: {
        id: createOrderDto.shippingAddressId,
        user: { id: userId },
      },
    });

    if (!shippingAddress) {
      throw new NotFoundException('收货地址不存在');
    }

    return this.dataSource.transaction(async (manager) => {
      const checkoutItems = createOrderDto.cartItemIds?.length
        ? await this.resolveCartItems(userId, createOrderDto.cartItemIds)
        : await this.resolveDirectItems(createOrderDto.items ?? []);

      let totalAmount = 0;

      for (const item of checkoutItems) {
        if (item.product.isOnSale !== true) {
          throw new BadRequestException(`商品未上架: ${item.product.name}`);
        }

        if (item.sku.stock < item.quantity) {
          throw new BadRequestException(`规格库存不足: ${item.sku.title}`);
        }

        totalAmount += Number(item.sku.price) * item.quantity;
      }

      const order = manager.create(Order, {
        orderNo: await this.generateOrderNo(manager),
        totalAmount: totalAmount.toFixed(2),
        status: OrderStatus.PENDING,
        remark: createOrderDto.remark,
        receiverName: shippingAddress.receiverName,
        receiverPhone: shippingAddress.receiverPhone,
        province: shippingAddress.province,
        city: shippingAddress.city,
        district: shippingAddress.district,
        detailAddress: shippingAddress.detailAddress,
        postalCode: shippingAddress.postalCode ?? null,
        paymentType: null,
        paymentNo: null,
        paidAt: null,
        user: { id: userId },
      });

      const savedOrder = await manager.save(Order, order);

      const orderItems = checkoutItems.map((item) =>
        manager.create(OrderItem, {
          order: savedOrder,
          product: item.product,
          sku: item.sku,
          quantity: item.quantity,
          price: item.sku.price,
          productName: item.product.name,
          skuTitle: item.sku.title,
          skuSpecs: item.sku.specs,
          productCover: item.sku.cover ?? item.product.cover ?? null,
        }),
      );

      await manager.save(OrderItem, orderItems);

      if (createOrderDto.cartItemIds?.length) {
        const cartItems = await manager.find(CartItem, {
          where: { id: In(createOrderDto.cartItemIds) },
        });

        if (cartItems.length > 0) {
          await manager.remove(CartItem, cartItems);
        }
      }

      return manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: {
          user: true,
          items: {
            product: true,
            sku: true,
          },
        },
      });
    });
  }

  async pay(userId: number, orderId: number, payOrderDto: PayOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const skuRepository = manager.getRepository(ProductSku);
      const productRepository = manager.getRepository(Product);
      const orderItemRepository = manager.getRepository(OrderItem);

      const order = await orderRepository.findOne({
        where: { id: orderId, user: { id: userId } },
        relations: {
          user: true,
          items: {
            product: true,
            sku: true,
          },
        },
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('当前订单不是待支付状态');
      }

      const touchedProducts = new Set<number>();

      for (const item of order.items) {
        const sku = await skuRepository.findOne({
          where: { id: item.sku?.id },
          relations: {
            product: true,
          },
        });

        if (!sku) {
          throw new NotFoundException(`订单规格不存在: ${item.skuTitle}`);
        }

        if (sku.stock < item.quantity) {
          throw new BadRequestException(`规格库存不足: ${sku.title}`);
        }

        sku.stock -= item.quantity;
        await skuRepository.save(sku);

        const product = sku.product;
        product.sales += item.quantity;
        await productRepository.save(product);

        item.sku = sku;
        item.product = product;
        touchedProducts.add(product.id);
      }

      order.status = OrderStatus.PAID;
      order.paymentType = payOrderDto.paymentType;
      order.paymentNo = this.generatePaymentNo(payOrderDto.paymentType);
      order.paidAt = new Date();

      await orderRepository.save(order);
      await orderItemRepository.save(order.items);

      for (const productId of touchedProducts) {
        await this.syncProductSummary(productId, manager);
      }

      return orderRepository.findOne({
        where: { id: order.id },
        relations: {
          user: true,
          items: {
            product: true,
            sku: true,
          },
        },
      });
    });
  }

  private ensureOrderSourceProvided(createOrderDto: CreateOrderDto) {
    const hasCartItems = Boolean(createOrderDto.cartItemIds?.length);
    const hasDirectItems = Boolean(createOrderDto.items?.length);

    if (hasCartItems === hasDirectItems) {
      throw new BadRequestException(
        '请在 cartItemIds 和 items 中二选一传递下单商品',
      );
    }
  }

  private async resolveCartItems(userId: number, cartItemIds: number[]) {
    const ids = [...new Set(cartItemIds)];
    const cartItems = await this.cartItemsRepository.find({
      where: {
        id: In(ids),
        cart: { user: { id: userId } },
      },
      relations: {
        cart: true,
        product: true,
        sku: true,
      },
    });

    if (cartItems.length !== ids.length) {
      const foundIds = new Set(cartItems.map((item) => item.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`购物车商品不存在: ${missingIds.join(', ')}`);
    }

    return cartItems.map((item) => ({
      quantity: item.quantity,
      product: item.product,
      sku: item.sku!,
    }));
  }

  private async resolveDirectItems(items: CreateOrderItemDto[]) {
    const normalizedItems = items.map((item) => ({
      ...item,
      key: `${item.productId}-${item.skuId}`,
    }));

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const skuIds = [...new Set(normalizedItems.map((item) => item.skuId))];

    const [products, skus] = await Promise.all([
      this.productsRepository.find({
        where: { id: In(productIds) },
      }),
      this.productSkusRepository.find({
        where: { id: In(skuIds) },
        relations: {
          product: true,
        },
      }),
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

    return normalizedItems.map((item) => {
      const product = productMap.get(item.productId);
      const sku = skuMap.get(item.skuId);

      if (!product) {
        throw new NotFoundException(`商品不存在: ${item.productId}`);
      }

      if (!sku || sku.product.id !== product.id) {
        throw new BadRequestException(`商品规格不存在: ${item.skuId}`);
      }

      return {
        quantity: item.quantity,
        product,
        sku,
      };
    });
  }

  private async syncProductSummary(
    productId: number,
    manager: EntityManager,
  ) {
    const skuRepository = manager.getRepository(ProductSku);
    const productRepository = manager.getRepository(Product);

    const [product, skus] = await Promise.all([
      productRepository.findOne({ where: { id: productId } }),
      skuRepository.find({
        where: { product: { id: productId } },
        order: { sort: 'ASC', id: 'ASC' },
      }),
    ]);

    if (!product || skus.length === 0) {
      return;
    }

    const minPriceSku = skus.reduce((min: ProductSku, sku: ProductSku) => {
      return Number(sku.price) < Number(min.price) ? sku : min;
    }, skus[0]);

    const defaultSku = skus.find((sku: ProductSku) => sku.isDefault) ?? skus[0];

    product.price = minPriceSku.price;
    product.stock = skus.reduce(
      (total: number, sku: ProductSku) => total + sku.stock,
      0,
    );
    product.cover = defaultSku.cover ?? minPriceSku.cover ?? product.cover;
    await productRepository.save(product);
  }

  private async generateOrderNo(manager: EntityManager) {
    const repository = manager.getRepository(Order);
    let orderNo = '';
    let exists = true;

    while (exists) {
      orderNo = `O${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`;

      exists = Boolean(
        await repository.findOne({
          where: { orderNo },
          select: ['id'],
        }),
      );
    }

    return orderNo;
  }

  private generatePaymentNo(paymentType: PaymentType) {
    const prefix = paymentType === PaymentType.ALIPAY ? 'ALI' : 'WX';
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
  }
}
