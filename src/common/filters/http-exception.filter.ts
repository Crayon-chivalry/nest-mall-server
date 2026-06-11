import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponseBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.getMessage(exceptionResponse, exception);

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }

  private getMessage(
    exceptionResponse: string | object | null,
    exception: unknown,
  ) {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as ExceptionResponseBody;
      if (Array.isArray(body.message)) {
        return body.message.join('; ');
      }

      if (body.message) {
        return body.message;
      }

      if (body.error) {
        return body.error;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return '服务器内部错误';
  }
}
