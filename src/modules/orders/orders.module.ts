import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../carts/entities/cart-item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductSku } from '../products/entities/product-sku.entity';
import { Product } from '../products/entities/product.entity';
import { ShippingAddress } from '../shipping-addresses/entities/shipping-address.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      Product,
      ProductSku,
      ShippingAddress,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
