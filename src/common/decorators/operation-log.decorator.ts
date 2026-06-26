import { OperationLogType } from '../enums/operation-log-type.enum';
import { SetMetadata } from '@nestjs/common';
import { OPERATION_LOG_KEY } from '../constants/operation-log.constants';

export interface OperationLogMetadata {
  module: string;
  action: string;
  logQuery?: boolean;
  type?: OperationLogType;
}

export function OperationLog(metadata: OperationLogMetadata) {
  return SetMetadata(OPERATION_LOG_KEY, metadata);
}
