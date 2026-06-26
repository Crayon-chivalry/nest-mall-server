import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Like, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const parent = await this.resolveParent(createCategoryDto.parentId);
    await this.ensureCategoryNameUnique(createCategoryDto.name, parent?.id);

    const category = this.categoriesRepository.create({
      name: createCategoryDto.name,
      icon: createCategoryDto.icon,
      isVisible: createCategoryDto.isVisible ?? true,
      sort: createCategoryDto.sort ?? 0,
      parent,
    });

    return this.findOne((await this.categoriesRepository.save(category)).id);
  }

  async findAll(queryDto: QueryCategoriesDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: Record<string, unknown> = {};
    const keyword = queryDto.keyword?.trim();

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (queryDto.parentId !== undefined) {
      where.parent = { id: queryDto.parentId };
    }

    if (queryDto.isVisible !== undefined) {
      where.isVisible = queryDto.isVisible;
    }

    if (queryDto.tree === false || queryDto.parentId !== undefined) {
      const [list, total] = await this.categoriesRepository.findAndCount({
        where,
        relations: {
          parent: true,
          children: true,
        },
        order: {
          sort: 'ASC',
          id: 'ASC',
          children: {
            sort: 'ASC',
            id: 'ASC',
          },
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

    type CategoryTreeNode = Category & { children: CategoryTreeNode[] };
    const rootWhere = {
      ...where,
      parent: IsNull(),
    };
    let roots: Category[] = [];
    let total = 0;

    if (keyword) {
      const keywordWhere: Record<string, unknown>[] = [
        {
          name: Like(`%${keyword}%`),
          parent: IsNull(),
        },
        {
          name: Like(`%${keyword}%`),
          parent: {
            parent: IsNull(),
          },
        },
      ];

      if (queryDto.isVisible !== undefined) {
        keywordWhere[0].isVisible = queryDto.isVisible;
        keywordWhere[1].isVisible = queryDto.isVisible;
      }

      const matchedCategories = await this.categoriesRepository.find({
        where: keywordWhere,
        relations: {
          parent: true,
        },
      });
      const matchedRootIds = Array.from(
        new Set(
          matchedCategories.map((item) =>
            item.parentId ? item.parentId : item.id,
          ),
        ),
      );

      total = matchedRootIds.length;

      if (matchedRootIds.length > 0) {
        roots = await this.categoriesRepository.find({
          where: {
            id: In(matchedRootIds),
            ...(queryDto.isVisible !== undefined
              ? { isVisible: queryDto.isVisible }
              : {}),
          },
          relations: {
            parent: true,
            children: true,
          },
          order: {
            sort: 'ASC',
            id: 'ASC',
            children: {
              sort: 'ASC',
              id: 'ASC',
            },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        });
      }
    } else {
      [roots, total] = await this.categoriesRepository.findAndCount({
        where: rootWhere,
        relations: {
          parent: true,
          children: true,
        },
        order: {
          sort: 'ASC',
          id: 'ASC',
          children: {
            sort: 'ASC',
            id: 'ASC',
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }

    const rootIds = roots.map((item) => item.id);

    if (rootIds.length === 0) {
      return {
        list: [],
        pagination: {
          page,
          pageSize,
          total,
        },
      };
    }

    const children = await this.categoriesRepository.find({
      where: {
        parent: {
          id: In(rootIds),
        },
      },
      relations: {
        parent: true,
        children: true,
      },
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });
    const filteredList = [...roots, ...children];
    const map = new Map<number, CategoryTreeNode>(
      filteredList.map((item) => [
        item.id,
        { ...(item as CategoryTreeNode), children: [] },
      ]),
    );

    for (const item of filteredList) {
      if (item.parentId) {
        const parent = map.get(item.parentId);

        if (parent) {
          parent.children.push(map.get(item.id)!);
        }
      }
    }

    return {
      list: roots.map((item) => map.get(item.id)!),
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  async findParentList() {
    return this.categoriesRepository.find({
      where: {
        parent: IsNull(),
      },
      order: {
        sort: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
      },
      order: {
        children: {
          sort: 'ASC',
          id: 'ASC',
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findCategoryOrFail(id);
    const nextParentId =
      updateCategoryDto.parentId === undefined
        ? category.parentId ?? undefined
        : updateCategoryDto.parentId;
    const parent = await this.resolveParent(nextParentId, id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      await this.ensureCategoryNameUnique(updateCategoryDto.name, parent?.id, id);
    }

    category.name = updateCategoryDto.name ?? category.name;
    category.icon = updateCategoryDto.icon ?? category.icon;
    category.isVisible = updateCategoryDto.isVisible ?? category.isVisible;
    category.sort = updateCategoryDto.sort ?? category.sort;

    if (updateCategoryDto.parentId !== undefined) {
      category.parent = parent;
    }

    return this.findOne((await this.categoriesRepository.save(category)).id);
  }

  async remove(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('请先删除该分类下的二级分类');
    }

    if (category.products.length > 0) {
      throw new BadRequestException('该分类下存在商品，无法删除');
    }

    await this.categoriesRepository.remove(category);

    return {
      id,
      success: true,
    };
  }

  private async resolveParent(parentId?: number, currentId?: number) {
    if (parentId === undefined) {
      return undefined;
    }

    const parent = await this.categoriesRepository.findOne({
      where: { id: parentId },
      relations: {
        parent: true,
      },
    });

    if (!parent) {
      throw new NotFoundException('父级分类不存在');
    }

    if (currentId && parent.id === currentId) {
      throw new BadRequestException('父级分类不能是自己');
    }

    if (parent.parentId) {
      throw new BadRequestException('当前仅支持两级分类结构，不能挂到二级分类下');
    }

    return parent;
  }

  private async ensureCategoryNameUnique(
    name: string,
    parentId?: number,
    excludeId?: number,
  ) {
    const siblings = await this.categoriesRepository.find({
      where: parentId ? { parent: { id: parentId } } : { parent: IsNull() },
      relations: {
        parent: true,
      },
    });

    const duplicated = siblings.find(
      (item) => item.name === name && item.id !== excludeId,
    );

    if (duplicated) {
      throw new BadRequestException('同级分类名称已存在');
    }
  }

  private async findCategoryOrFail(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: {
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }
}
