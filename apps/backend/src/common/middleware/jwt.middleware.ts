import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);

    if (token) {
      try {
        const payload = this.verifyToken(token);
        req["user"] = payload;
      } catch (e) {
        throw new UnauthorizedException("Nieprawidłowy token");
      }
    }

    next();
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private verifyToken(token: string): any {
    try {
      return this.jwt.verify(token);
    } catch (e) {
      console.log("Błąd weryfikacji tokenu: ", e.message);
      throw e;
    }
  }
}
