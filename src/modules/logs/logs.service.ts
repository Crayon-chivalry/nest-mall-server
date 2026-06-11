import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, FindOptionsWhere, Like, Repository } from 'typeorm';
import { QueryAdminOperationLogsDto } from './dto/query-admin-operation-logs.dto';
import { AdminOperationLog } from './entities/admin-operation-log.entity';

interface CreateOperationLogInput {
  operatorUserId?: string;
  operatorNickname?: string;
  operatorPhone?: string;
  module: string;
  action: string;
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

    if (queryDto.isSuccess !== undefined) {
      where.isSuccess = queryDto.isSuccess;
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
}
