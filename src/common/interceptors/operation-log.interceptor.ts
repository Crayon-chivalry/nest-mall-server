import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { RequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { LogsService } from 'src/modules/logs/logs.service';
import { OPERATION_LOG_KEY } from '../constants/operation-log.constants';
import { OperationLogMetadata } from '../decorators/operation-log.decorator';

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logsService: LogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.getAllAndOverride<OperationLogMetadata>(
      OPERATION_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          void this.logsService.createOperationLog({
            operatorUserId: request.user?.userId,
            operatorNickname: request.user?.nickname,
            operatorPhone: request.user?.phone,
            module: metadata.module,
            action: metadata.action,
            method: request.method,
            path: request.originalUrl || request.url,
            ip: request.ip,
            requestData: this.stringifyRequestData(
              request.body,
              request.query,
              request.params,
            ),
            isSuccess: true,
            duration: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          void this.logsService.createOperationLog({
            operatorUserId: request.user?.userId,
            operatorNickname: request.user?.nickname,
            operatorPhone: request.user?.phone,
            module: metadata.module,
            action: metadata.action,
            method: request.method,
            path: request.originalUrl || request.url,
            ip: request.ip,
            requestData: this.stringifyRequestData(
              request.body,
              request.query,
              request.params,
            ),
            isSuccess: false,
            errorMessage,
            duration: Date.now() - startedAt,
          });
        },
      }),
    );
  }

  private stringifyRequestData(
    body: unknown,
    query: unknown,
    params: unknown,
  ) {
    try {
      return JSON.stringify({
        body,
        query,
        params,
      });
    } catch {
      return undefined;
    }
  }
}
