import * as pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../../infra/logger/logger.js';

export const requestLogger = (pinoHttp as any).default({
  logger,

  genReqId(req: any, res: any) {
    const existing = req.headers['x-request-id'];
    const id = typeof existing === 'string' ? existing : randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },

  customLogLevel(req: any, res: any, err: any) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  serializers: {
    req(req: any) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res: any) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
