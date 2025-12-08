import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
  }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void): void {
    const token = this.extractTokenFromHeader(req);

    if (token) {
      try {
        (req as any).user = this.verifyToken(token);
      } catch {
        res.statusCode = 401;
        res.end(
          JSON.stringify({
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            message: this.i18n.t('messages.Auth.errors.invalidToken'),
          }),
        );
        return;
      }
    }

    next();
  }

  private extractTokenFromHeader(req: FastifyRequest['raw']): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization) return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token: string): any {
    try {
      return this.jwt.verify(token);
    } catch (e) {
      console.error(this.i18n.t('messages.Auth.errors.verifyingTokenFailed'), e);
      throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));
    }
  }
}
