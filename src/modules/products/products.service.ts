import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const product = this.productsRepository.create({
      name: createProductDto.name,
      price: createProductDto.price,
      stock: createProductDto.stock,
      cover: createProductDto.cover,
      description: createProductDto.description,
      isOnSale: createProductDto.isOnSale ?? true,
      category,
    });

    return this.productsRepository.save(product);
  }

  findAll() {
    return this.productsRepository.find({
      relations: {
        category: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
