import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateHomeEntryDto } from './dto/create-home-entry.dto';
import { QueryHomeEntriesDto } from './dto/query-home-entries.dto';
import { UpdateHomeEntryStatusDto } from './dto/update-home-entry-status.dto';
import { UpdateHomeEntryDto } from './dto/update-home-entry.dto';
import { HomeEntry } from './entities/home-entry.entity';

@Injectable()
export class HomeEntriesService {
  constructor(
    @InjectRepository(HomeEntry)
    private readonly homeEntriesRepository: Repository<HomeEntry>,
  ) {}

  async create(createHomeEntryDto: CreateHomeEntryDto) {
    const entry = this.homeEntriesRepository.create({
      ...createHomeEntryDto,
      sort: createHomeEntryDto.sort ?? 0,
      isEnabled: createHomeEntryDto.isEnabled ?? true,
    });

    return this.homeEntriesRepository.save(entry);
  }

  async findAll(queryDto: QueryHomeEntriesDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;
    const where: FindOptionsWhere<HomeEntry> = {};

    if (queryDto.title) {
      where.title = Like(`%${queryDto.title}%`);
    }

    if (queryDto.isEnabled !== undefined) {
      where.isEnabled = queryDto.isEnabled;
    }

    const [list, total] = await this.homeEntriesRepository.findAndCount({
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
    return this.findHomeEntryOrFail(id);
  }

  async update(id: number, updateHomeEntryDto: UpdateHomeEntryDto) {
    const entry = await this.findHomeEntryOrFail(id);
    Object.assign(entry, updateHomeEntryDto);
    return this.homeEntriesRepository.save(entry);
  }

  async updateStatus(
    id: number,
    updateHomeEntryStatusDto: UpdateHomeEntryStatusDto,
  ) {
    const entry = await this.findHomeEntryOrFail(id);
    entry.isEnabled = updateHomeEntryStatusDto.isEnabled;
    return this.homeEntriesRepository.save(entry);
  }

  async remove(id: number) {
    const entry = await this.findHomeEntryOrFail(id);
    await this.homeEntriesRepository.remove(entry);

    return {
      id,
      success: true,
    };
  }

  async findActiveList() {
    return this.homeEntriesRepository.find({
      where: { isEnabled: true },
      order: {
        sort: 'ASC',
        id: 'DESC',
      },
    });
  }

  private async findHomeEntryOrFail(id: number) {
    const entry = await this.homeEntriesRepository.findOne({ where: { id } });

    if (!entry) {
      throw new NotFoundException('金刚区入口不存在');
    }

    return entry;
  }
}
