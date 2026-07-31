import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductSkuDto } from './dto/product-sku.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSku } from './entities/product-sku.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly productSkusRepository: Repository<ProductSku>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.findLeafCategoryOrFail(createProductDto.categoryId);
    const { summary, skus } = this.buildSkuPayload(createProductDto);

    const product = this.productsRepository.create({
      name: createProductDto.name,
      price: summary.price,
      stock: summary.stock,
      cover: summary.cover,
      images: createProductDto.images,
      description: createProductDto.description,
      detailContent: createProductDto.detailContent,
      isOnSale: createProductDto.isOnSale ?? true,
      category,
      skus: skus.map((sku, index) =>
        this.productSkusRepository.create({
          ...sku,
          sort: index,
        }),
      ),
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
        skus: true,
      },
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: list.map((item) => this.sortProductSkus(item)),
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
        skus: true,
      },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return this.sortProductSkus(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findProductOrFail(id);

    if (updateProductDto.categoryId !== undefined) {
      product.category = await this.findLeafCategoryOrFail(updateProductDto.categoryId);
    }

    product.name = updateProductDto.name ?? product.name;
    product.images = updateProductDto.images ?? product.images;
    product.description = updateProductDto.description ?? product.description;
    product.detailContent = updateProductDto.detailContent ?? product.detailContent;
    product.isOnSale = updateProductDto.isOnSale ?? product.isOnSale;

    const { summary, skus } = this.buildSkuPayload(updateProductDto, product);
    product.price = summary.price;
    product.stock = summary.stock;
    product.cover = summary.cover;

    if (product.skus.length > 0) {
      await this.productSkusRepository.remove(product.skus);
    }

    product.skus = skus.map((sku, index) =>
      this.productSkusRepository.create({
        ...sku,
        sort: index,
      }),
    );

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
      throw new BadRequestException('商品必须归属于二级分类');
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
        skus: true,
      },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  private buildSkuPayload(
    productDto: CreateProductDto | UpdateProductDto,
    existingProduct?: Product,
  ) {
    const skuInputs =
      productDto.skus && productDto.skus.length > 0
        ? productDto.skus
        : this.buildFallbackSingleSku(productDto, existingProduct);

    if (skuInputs.length === 0) {
      throw new BadRequestException('商品至少需要一个规格 SKU');
    }

    const currentImages = productDto.images ?? existingProduct?.images ?? [];
    if (currentImages.length === 0) {
      throw new BadRequestException('商品至少需要一张主图');
    }

    const explicitDefaultIndex = skuInputs.findIndex(
      (sku) => sku.isDefault === true,
    );
    const defaultSkuIndex = explicitDefaultIndex >= 0 ? explicitDefaultIndex : 0;

    const normalizedSkus = skuInputs.map((sku, index) => ({
      title: sku.title,
      specs: sku.specs ?? [],
      price: sku.price,
      stock: sku.stock,
      cover: sku.cover,
      isDefault: index === defaultSkuIndex,
    }));

    const minPriceSku = normalizedSkus.reduce((min, sku) => {
      return Number(sku.price) < Number(min.price) ? sku : min;
    }, normalizedSkus[0]);

    return {
      summary: {
        price: minPriceSku.price,
        stock: normalizedSkus.reduce((total, sku) => total + sku.stock, 0),
        cover: this.resolveProductCover(productDto, currentImages, existingProduct),
      },
      skus: normalizedSkus,
    };
  }

  private buildFallbackSingleSku(
    productDto: CreateProductDto | UpdateProductDto,
    existingProduct?: Product,
  ): ProductSkuDto[] {
    if (existingProduct?.skus?.length === 1) {
      const currentSku = existingProduct.skus[0];
      return [
        {
          title: productDto.name ?? currentSku.title,
          specs: currentSku.specs,
          price: productDto.price ?? currentSku.price,
          stock: productDto.stock ?? currentSku.stock,
          cover: productDto.cover ?? currentSku.cover,
          isDefault: true,
        },
      ];
    }

    if (productDto.price && productDto.stock !== undefined) {
      return [
        {
          title: productDto.name ?? existingProduct?.name ?? '默认规格',
          specs: [],
          price: productDto.price,
          stock: productDto.stock,
          cover: productDto.cover,
          isDefault: true,
        },
      ];
    }

    if (existingProduct?.skus?.length) {
      return existingProduct.skus.map((sku) => ({
        title: sku.title,
        specs: sku.specs,
        price: sku.price,
        stock: sku.stock,
        cover: sku.cover,
        isDefault: sku.isDefault,
      }));
    }

    return [];
  }

  private resolveProductCover(
    productDto: CreateProductDto | UpdateProductDto,
    images: string[],
    existingProduct?: Product,
  ) {
    if (productDto.cover !== undefined) {
      return productDto.cover;
    }

    if (images.length > 0) {
      return images[0];
    }

    return existingProduct?.cover;
  }

  private sortProductSkus(product: Product) {
    product.skus = [...(product.skus ?? [])].sort((a, b) => {
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
      return a.id - b.id;
    });

    if (!product.cover && product.images.length > 0) {
      product.cover = product.images[0];
    }

    return product;
  }
}
