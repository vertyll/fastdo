import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  public use(_req: any, res: any, next: () => void): void {
    const requestId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.time(`Request-response time ${requestId}`);

    res.on('finish', () => console.timeEnd(`Request-response time ${requestId}`));
    next();
  }
}
