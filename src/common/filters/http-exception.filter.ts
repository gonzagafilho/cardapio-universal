import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RequestMeta = Request & {
  requestId?: string;
  startTime?: number;
  user?: { tenantId?: string; establishmentId?: string; sub?: string };
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestMeta>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Erro interno do servidor';

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      message = { message: 'Muitas requisições. Tente novamente em alguns instantes.', statusCode: 429 };
    }

    const body =
      typeof message === 'object' && message !== null
        ? message
        : { message, statusCode: status };

    const durationMs = request.startTime != null ? Date.now() - request.startTime : undefined;
    const meta = [
      request.requestId && `requestId=${request.requestId}`,
      request.user?.tenantId && `tenantId=${request.user.tenantId}`,
      request.user?.establishmentId != null && `establishmentId=${request.user.establishmentId}`,
      durationMs != null && `duration=${durationMs}ms`,
    ]
      .filter(Boolean)
      .join(' ');
    const logLine = `${request.method} ${request.url} ${status}${meta ? ` ${meta}` : ''}`;
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      this.logger.warn(logLine);
    } else if (status >= 500) {
      this.logger.error(logLine, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.log(logLine);
    }

    response.status(status).json({
      ...(typeof body === 'object' && body !== null ? body : { message: body }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
