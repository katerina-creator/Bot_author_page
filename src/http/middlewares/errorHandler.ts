import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // express требует next, даже если не используем
  void next;

  const requestId = (req as any).id; // pino-http кладёт id в req.id

  const status = Number(err?.statusCode || err?.status || 500);
  const code = err?.code || (status >= 500 ? 'internal_error' : 'bad_request');
  const message = err?.message || 'Unexpected error';

  // Логируем полностью только на серверных ошибках, на 4xx — warn
  const level = status >= 500 ? 'error' : 'warn';

  logger[level](
    { err, requestId, status, code, path: req.path, method: req.method },
    'Request failed'
  );

  if (res.headersSent) return;

  res.status(status).json({
    error: {
      code,
      message,
    },
    requestId,
  });
}
