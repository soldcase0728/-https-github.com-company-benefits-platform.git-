import { v4 as uuidv4 } from 'uuid';

export function tracingMiddleware(req: any, res: any, next: any) {
  const traceId = req.headers['x-trace-id'] || uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
}
