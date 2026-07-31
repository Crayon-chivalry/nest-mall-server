import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { AppProductsController } from './app-products.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductSku } from './entities/product-sku.entity';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSku, Category])],
  controllers: [ProductsController, AppProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
