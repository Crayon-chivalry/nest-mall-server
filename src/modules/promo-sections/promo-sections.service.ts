import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { PromoSectionLayout } from 'src/common/enums/promo-section-layout.enum';
import { CreatePromoSectionDto } from './dto/create-promo-section.dto';
import { QueryPromoSectionsDto } from './dto/query-promo-sections.dto';
import { UpdatePromoSectionStatusDto } from './dto/update-promo-section-status.dto';
import { UpdatePromoSectionDto } from './dto/update-promo-section.dto';
import { PromoSection } from './entities/promo-section.entity';

@Injectable()
export class PromoSectionsService {
  constructor(
    @InjectRepository(PromoSection)
    private readonly promoSectionsRepository: Repository<PromoSection>,
  ) {}

  async create(createPromoSectionDto: CreatePromoSectionDto) {
    this.validateImageItems(
      createPromoSectionDto.layoutType,
      createPromoSectionDto.imageItems,
    );

    const promoSection = this.promoSectionsRepository.create({
      ...createPromoSectionDto,
      sort: createPromoSectionDto.sort ?? 0,
      isEnabled: createPromoSectionDto.isEnabled ?? true,
    });

    return this.promoSectionsRepository.save(promoSection);
  }

  async findAll(queryDto: QueryPromoSectionsDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: FindOptionsWhere<PromoSection> = {};

    if (queryDto.title) {
      where.title = Like(`%${queryDto.title}%`);
    }

    if (queryDto.layoutType) {
      where.layoutType = queryDto.layoutType;
    }

    if (queryDto.isEnabled !== undefined) {
      where.isEnabled = queryDto.isEnabled;
    }

    const [list, total] = await this.promoSectionsRepository.findAndCount({
      where,
      order: {
        sort: 'ASC',
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
    return this.findPromoSectionOrFail(id);
  }

  async update(id: number, updatePromoSectionDto: UpdatePromoSectionDto) {
    const promoSection = await this.findPromoSectionOrFail(id);

    const layoutType = updatePromoSectionDto.layoutType ?? promoSection.layoutType;
    const imageItems = updatePromoSectionDto.imageItems ?? promoSection.imageItems;
    this.validateImageItems(layoutType, imageItems);

    Object.assign(promoSection, updatePromoSectionDto);
    return this.promoSectionsRepository.save(promoSection);
  }

  async updateStatus(
    id: number,
    updatePromoSectionStatusDto: UpdatePromoSectionStatusDto,
  ) {
    const promoSection = await this.findPromoSectionOrFail(id);
    promoSection.isEnabled = updatePromoSectionStatusDto.isEnabled;
    return this.promoSectionsRepository.save(promoSection);
  }

  async remove(id: number) {
    const promoSection = await this.findPromoSectionOrFail(id);
    await this.promoSectionsRepository.remove(promoSection);

    return {
      id,
      success: true,
    };
  }

  async findActiveList() {
    return this.promoSectionsRepository.find({
      where: { isEnabled: true },
      order: {
        sort: 'ASC',
        id: 'DESC',
      },
    });
  }

  private async findPromoSectionOrFail(id: number) {
    const promoSection = await this.promoSectionsRepository.findOne({
      where: { id },
    });

    if (!promoSection) {
      throw new NotFoundException('首页广告位不存在');
    }

    return promoSection;
  }

  private validateImageItems(
    layoutType: PromoSectionLayout,
    imageItems: PromoSection['imageItems'],
  ) {
    const expectedCountMap: Record<PromoSectionLayout, number> = {
      [PromoSectionLayout.SINGLE]: 1,
      [PromoSectionLayout.DOUBLE]: 2,
      [PromoSectionLayout.TRIPLE]: 3,
    };

    const expectedCount = expectedCountMap[layoutType];

    if (imageItems.length !== expectedCount) {
      throw new BadRequestException(
        `${layoutType} 布局必须配置 ${expectedCount} 张图片`,
      );
    }
  }
}
