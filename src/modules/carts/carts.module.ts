import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSku } from '../products/entities/product-sku.entity';
import { Product } from '../products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product, ProductSku])],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [TypeOrmModule],
})
export class CartsModule {}
