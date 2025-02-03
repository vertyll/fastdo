import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthGuardEnum } from '../enums/auth-guard.enum';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(AuthGuardEnum.JwtRefreshAuthGuard) {}
