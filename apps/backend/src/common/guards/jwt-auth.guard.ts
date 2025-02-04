import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { Observable, lastValueFrom } from 'rxjs';
import { CustomClsStore } from '../../core/config/types/app.config.type';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuardEnum } from '../enums/auth-guard.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthGuardEnum.JwtAuthGuard) {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService<CustomClsStore>,
  ) {
    super();
  }

  public async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const canActivate = super.canActivate(context);
    const result = canActivate instanceof Observable
      ? await lastValueFrom(canActivate)
      : await canActivate;

    if (result) {
      const request = context.switchToHttp().getRequest<FastifyRequest>();
      if (request.user) {
        this.cls.set('user', {
          userId: Number(request.user.id),
          userEmail: request.user.email,
          userRoles: request.user.roles,
        });
      }
    }

    return result;
  }
}
