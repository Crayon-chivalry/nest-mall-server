import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSku } from '../products/entities/product-sku.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly productSkusRepository: Repository<ProductSku>,
  ) {}

  async findAll(userId: number) {
    return this.ensureCart(userId);
  }

  async addItem(userId: number, addCartItemDto: AddCartItemDto) {
    const cart = await this.ensureCart(userId);
    const { product, sku } = await this.findProductAndSkuOrFail(
      addCartItemDto.productId,
      addCartItemDto.skuId,
    );

    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: product.id },
        sku: { id: sku.id },
      },
      relations: {
        cart: true,
        product: true,
        sku: true,
      },
    });

    const targetQuantity =
      (existingItem?.quantity ?? 0) + addCartItemDto.quantity;
    this.ensureSkuStockEnough(sku, targetQuantity);

    if (existingItem) {
      existingItem.quantity = targetQuantity;
      await this.cartItemsRepository.save(existingItem);
      return this.ensureCart(userId);
    }

    const item = this.cartItemsRepository.create({
      quantity: addCartItemDto.quantity,
      cart,
      product,
      sku,
    });

    await this.cartItemsRepository.save(item);
    return this.ensureCart(userId);
  }

  async updateQuantity(
    userId: number,
    itemId: number,
    updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ) {
    const item = await this.findCartItemOrFail(userId, itemId);
    this.ensureSkuStockEnough(item.sku!, updateCartItemQuantityDto.quantity);
    item.quantity = updateCartItemQuantityDto.quantity;
    await this.cartItemsRepository.save(item);
    return this.ensureCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    const item = await this.findCartItemOrFail(userId, itemId);
    await this.cartItemsRepository.remove(item);
    return {
      id: itemId,
      success: true,
    };
  }

  async clear(userId: number) {
    const cart = await this.ensureCart(userId);
    if ((cart.items ?? []).length > 0) {
      await this.cartItemsRepository.remove(cart.items);
    }

    return {
      success: true,
    };
  }

  private async ensureCart(userId: number) {
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: {
          product: true,
          sku: true,
        },
      },
    });

    if (!cart) {
      cart = await this.cartsRepository.save(
        this.cartsRepository.create({
          isActive: true,
          user: { id: userId },
          items: [],
        }),
      );

      cart = await this.cartsRepository.findOne({
        where: { id: cart.id },
        relations: {
          user: true,
          items: {
            product: true,
            sku: true,
          },
        },
      });
    }

    return cart!;
  }

  private async findProductAndSkuOrFail(productId: number, skuId: number) {
    const [product, sku] = await Promise.all([
      this.productsRepository.findOne({
        where: { id: productId, isOnSale: true },
      }),
      this.productSkusRepository.findOne({
        where: { id: skuId },
        relations: {
          product: true,
        },
      }),
    ]);

    if (!product) {
      throw new NotFoundException('商品不存在或未上架');
    }

    if (!sku || sku.product.id !== product.id) {
      throw new BadRequestException('商品规格不存在');
    }

    return { product, sku };
  }

  private async findCartItemOrFail(userId: number, itemId: number) {
    const item = await this.cartItemsRepository.findOne({
      where: {
        id: itemId,
        cart: { user: { id: userId } },
      },
      relations: {
        cart: true,
        product: true,
        sku: true,
      },
    });

    if (!item) {
      throw new NotFoundException('购物车商品不存在');
    }

    return item;
  }

  private ensureSkuStockEnough(sku: ProductSku, quantity: number) {
    if (sku.stock < quantity) {
      throw new BadRequestException('商品规格库存不足');
    }
  }
}
