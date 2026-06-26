import { AppBaseEntity } from 'src/common/entities/base.entity';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { Column, Entity } from 'typeorm';

@Entity('admin_operation_logs')
export class AdminOperationLog extends AppBaseEntity {
  @Column({ length: 32, nullable: true })
  operatorUserId?: string;

  @Column({ length: 30, nullable: true })
  operatorNickname?: string;

  @Column({ length: 20, nullable: true })
  operatorPhone?: string;

  @Column({ length: 100 })
  module!: string;

  @Column({ length: 100 })
  action!: string;

  @Column({
    type: 'enum',
    enum: OperationLogType,
    default: OperationLogType.NORMAL,
  })
  type!: OperationLogType;

  @Column({ length: 20 })
  method!: string;

  @Column({ length: 255 })
  path!: string;

  @Column({ length: 50, nullable: true })
  ip?: string;

  @Column({ type: 'text', nullable: true })
  requestData?: string;

  @Column({ default: true })
  isSuccess!: boolean;

  @Column({ length: 255, nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', default: 0 })
  duration!: number;
}
