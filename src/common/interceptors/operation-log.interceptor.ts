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
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { LogsService } from 'src/modules/logs/logs.service';
import { getRequestIp } from '../utils/request-ip.util';
import { OPERATION_LOG_KEY } from '../constants/operation-log.constants';
import { OperationLogMetadata } from '../decorators/operation-log.decorator';

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

const QUERY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

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
    const shouldLogQuery = metadata.logQuery === true;

    if (QUERY_METHODS.has(request.method.toUpperCase()) && !shouldLogQuery) {
      return next.handle();
    }

    const startedAt = Date.now();
    const ip = getRequestIp(request);
    const operator = this.resolveOperator(request);

    return next.handle().pipe(
      tap({
        next: () => {
          void this.logsService.createOperationLog({
            operatorUserId: operator?.userId,
            operatorNickname: operator?.nickname,
            operatorPhone: operator?.phone,
            module: metadata.module,
            action: metadata.action,
            type: metadata.type ?? OperationLogType.NORMAL,
            method: request.method,
            path: request.originalUrl || request.url,
            ip,
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
            operatorUserId: operator?.userId,
            operatorNickname: operator?.nickname,
            operatorPhone: operator?.phone,
            module: metadata.module,
            action: metadata.action,
            type: metadata.type ?? OperationLogType.NORMAL,
            method: request.method,
            path: request.originalUrl || request.url,
            ip,
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

  private resolveOperator(request: AuthenticatedRequest) {
    if (request.user?.userId || request.user?.nickname || request.user?.phone) {
      return request.user;
    }

    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string') {
      return undefined;
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : authorization.trim();

    if (!token) {
      return undefined;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return undefined;
    }

    const userId =
      typeof payload.userId === 'string' ? payload.userId : undefined;
    const nickname =
      typeof payload.nickname === 'string' ? payload.nickname : undefined;
    const phone = typeof payload.phone === 'string' ? payload.phone : undefined;

    if (!userId && !nickname && !phone) {
      return undefined;
    }

    return {
      id: typeof payload.sub === 'number' ? payload.sub : Number(payload.sub),
      userId,
      nickname,
      phone,
      role: payload.role,
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.filter((item): item is string => typeof item === 'string')
        : [],
    };
  }

  private decodeJwtPayload(token: string) {
    const parts = token.split('.');
    if (parts.length < 2) {
      return undefined;
    }

    try {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );

      return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
        sub?: string | number;
        userId?: string;
        nickname?: string;
        phone?: string;
        role?: unknown;
        permissions?: unknown;
      };
    } catch {
      return undefined;
    }
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
