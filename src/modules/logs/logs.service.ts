import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOperator,
  FindOptionsWhere,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { QueryAdminOperationLogsDto } from './dto/query-admin-operation-logs.dto';
import { AdminOperationLog } from './entities/admin-operation-log.entity';

interface CreateOperationLogInput {
  operatorUserId?: string;
  operatorNickname?: string;
  operatorPhone?: string;
  module: string;
  action: string;
  type?: OperationLogType;
  method: string;
  path: string;
  ip?: string;
  requestData?: string;
  isSuccess: boolean;
  errorMessage?: string;
  duration: number;
}

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(AdminOperationLog)
    private readonly adminOperationLogsRepository: Repository<AdminOperationLog>,
  ) {}

  createOperationLog(input: CreateOperationLogInput) {
    const log = this.adminOperationLogsRepository.create(input);
    return this.adminOperationLogsRepository.save(log);
  }

  async findAll(queryDto: QueryAdminOperationLogsDto) {
    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 10;

    const where: FindOptionsWhere<AdminOperationLog> = {};

    if (queryDto.module) {
      where.module = Like(`%${queryDto.module}%`) as FindOperator<string>;
    }

    if (queryDto.action) {
      where.action = Like(`%${queryDto.action}%`) as FindOperator<string>;
    }

    if (queryDto.operatorPhone) {
      where.operatorPhone = queryDto.operatorPhone;
    }

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.isSuccess !== undefined) {
      where.isSuccess = queryDto.isSuccess;
    }

    if (queryDto.date) {
      const startOfDay = new Date(`${queryDto.date}T00:00:00`);
      const endOfDay = new Date(`${queryDto.date}T23:59:59.999`);
      where.createdAt = Between(startOfDay, endOfDay);
    }

    const [list, total] = await this.adminOperationLogsRepository.findAndCount({
      where,
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

  async getSummary() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [todayCount, abnormalLoginCount24h, dangerousOperationCount24h] =
      await Promise.all([
        this.adminOperationLogsRepository.count({
          where: {
            createdAt: MoreThanOrEqual(todayStart),
          },
        }),
        this.adminOperationLogsRepository.count({
          where: {
            createdAt: MoreThanOrEqual(last24Hours),
            isSuccess: false,
            action: Like('%登录失败%') as FindOperator<string>,
          },
        }),
        this.adminOperationLogsRepository.count({
          where: {
            createdAt: MoreThanOrEqual(last24Hours),
            type: OperationLogType.DANGEROUS,
          },
        }),
      ]);

    return {
      todayCount,
      abnormalLoginCount24h,
      dangerousOperationCount24h,
    };
  }
}
