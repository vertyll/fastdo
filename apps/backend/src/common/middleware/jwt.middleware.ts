import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: any;
  }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService) {}

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    const token = this.extractTokenFromHeader(req);

    if (token) {
      try {
        const payload = this.verifyToken(token);
        (req as any).user = payload;
      } catch (e) {
        res.statusCode = 401;
        res.end(
          JSON.stringify({
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            message: "Invalid token",
          })
        );
        return;
      }
    }

    next();
  }

  private extractTokenFromHeader(
    req: FastifyRequest["raw"]
  ): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization) return undefined;

    const [type, token] = authorization.split(" ");
    return type === "Bearer" ? token : undefined;
  }

  private verifyToken(token: string): any {
    try {
      return this.jwt.verify(token);
    } catch (e) {
      console.log("Error verifying token", e.message);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
