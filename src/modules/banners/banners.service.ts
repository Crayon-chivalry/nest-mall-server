import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateBannerDto } from './dto/create-banner.dto';
import { QueryBannersDto } from './dto/query-banners.dto';
import { UpdateBannerStatusDto } from './dto/update-banner-status.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannersRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    this.validateBannerTimeRange(
      createBannerDto.startTime,
      createBannerDto.endTime,
    );

    const banner = this.bannersRepository.create({
      ...createBannerDto,
      sort: createBannerDto.sort ?? 0,
      isEnabled: createBannerDto.isEnabled ?? true,
    });

    return this.bannersRepository.save(banner);
  }

  async findAll(queryDto: QueryBannersDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: FindOptionsWhere<Banner> = {};

    if (queryDto.title) {
      where.title = Like(`%${queryDto.title}%`);
    }

    if (queryDto.isEnabled !== undefined) {
      where.isEnabled = queryDto.isEnabled;
    }

    const [list, total] = await this.bannersRepository.findAndCount({
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
    const banner = await this.findBannerOrFail(id);
    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    const banner = await this.findBannerOrFail(id);

    const startTime =
      updateBannerDto.startTime !== undefined
        ? updateBannerDto.startTime
        : banner.startTime ?? undefined;
    const endTime =
      updateBannerDto.endTime !== undefined
        ? updateBannerDto.endTime
        : banner.endTime ?? undefined;

    this.validateBannerTimeRange(startTime, endTime);

    Object.assign(banner, updateBannerDto);
    return this.bannersRepository.save(banner);
  }

  async updateStatus(id: number, updateBannerStatusDto: UpdateBannerStatusDto) {
    const banner = await this.findBannerOrFail(id);
    banner.isEnabled = updateBannerStatusDto.isEnabled;
    return this.bannersRepository.save(banner);
  }

  async remove(id: number) {
    const banner = await this.findBannerOrFail(id);
    await this.bannersRepository.remove(banner);

    return {
      id,
      success: true,
    };
  }

  async findActiveList() {
    const now = new Date();

    return this.bannersRepository.find({
      where: [
        {
          isEnabled: true,
          startTime: LessThanOrEqual(now),
          endTime: MoreThanOrEqual(now),
        },
        {
          isEnabled: true,
          startTime: LessThanOrEqual(now),
          endTime: IsNull(),
        },
        {
          isEnabled: true,
          startTime: IsNull(),
          endTime: MoreThanOrEqual(now),
        },
        {
          isEnabled: true,
          startTime: IsNull(),
          endTime: IsNull(),
        },
      ],
      order: {
        sort: 'ASC',
        id: 'DESC',
      },
    });
  }

  private async findBannerOrFail(id: number) {
    const banner = await this.bannersRepository.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    return banner;
  }

  private validateBannerTimeRange(startTime?: Date, endTime?: Date) {
    if (startTime && endTime && startTime.getTime() > endTime.getTime()) {
      throw new BadRequestException('结束时间不能早于开始时间');
    }
  }
}
