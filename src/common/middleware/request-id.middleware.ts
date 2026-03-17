import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/** Request-scoped ID for log correlation. Set before guards/controllers. */
export const REQUEST_ID_HEADER = 'X-Request-Id';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = randomUUID();
  const r = req as Request & { requestId?: string; startTime?: number };
  r.requestId = id;
  r.startTime = Date.now();
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}
