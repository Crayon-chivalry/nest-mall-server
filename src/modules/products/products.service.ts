import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
    const category = await this.findLeafCategoryOrFail(createProductDto.categoryId);
    const product = this.productsRepository.create({
      name: createProductDto.name,
      price: createProductDto.price,
      stock: createProductDto.stock,
      cover: createProductDto.cover,
      description: createProductDto.description,
      isOnSale: createProductDto.isOnSale ?? true,
      category,
    });

    return this.findOne((await this.productsRepository.save(product)).id);
  }

  async findAll(queryDto: QueryProductsDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: FindOptionsWhere<Product> = {};

    if (queryDto.keyword) {
      where.name = Like(`%${queryDto.keyword}%`);
    }

    if (queryDto.categoryId !== undefined) {
      where.category = { id: queryDto.categoryId };
    } else if (queryDto.parentCategoryId !== undefined) {
      where.category = { parent: { id: queryDto.parentCategoryId } };
    }

    if (queryDto.isOnSale !== undefined) {
      where.isOnSale = queryDto.isOnSale;
    }

    const [list, total] = await this.productsRepository.findAndCount({
      where,
      relations: {
        category: {
          parent: true,
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

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: {
          parent: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findProductOrFail(id);

    if (updateProductDto.categoryId !== undefined) {
      product.category = await this.findLeafCategoryOrFail(updateProductDto.categoryId);
    }

    product.name = updateProductDto.name ?? product.name;
    product.price = updateProductDto.price ?? product.price;
    product.stock = updateProductDto.stock ?? product.stock;
    product.cover = updateProductDto.cover ?? product.cover;
    product.description = updateProductDto.description ?? product.description;
    product.isOnSale = updateProductDto.isOnSale ?? product.isOnSale;

    return this.findOne((await this.productsRepository.save(product)).id);
  }

  async updateStatus(id: number, updateProductStatusDto: UpdateProductStatusDto) {
    const product = await this.findProductOrFail(id);
    product.isOnSale = updateProductStatusDto.isOnSale;
    return this.findOne((await this.productsRepository.save(product)).id);
  }

  async remove(id: number) {
    const product = await this.findProductOrFail(id);
    await this.productsRepository.remove(product);

    return {
      id,
      success: true,
    };
  }

  private async findLeafCategoryOrFail(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (!category.parentId) {
      throw new BadRequestException('商品必须归属到二级分类');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('当前分类不是最终二级分类，不能直接挂商品');
    }

    return category;
  }

  private async findProductOrFail(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }
}
