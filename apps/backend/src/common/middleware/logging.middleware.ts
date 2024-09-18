import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestId = Date.now();
    console.time(`Request-response time ${requestId}`);

    res.on("finish", () =>
      console.timeEnd(`Request-response time ${requestId}`)
    );
    next();
  }
}
