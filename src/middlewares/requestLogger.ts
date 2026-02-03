import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

export const requestLogger = pinoHttp({
  logger,

  genReqId(req, res) {
    const existing = req.headers['x-request-id'];
    const id = typeof existing === 'string' ? existing : randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
