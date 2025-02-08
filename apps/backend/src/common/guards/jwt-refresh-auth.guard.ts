import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from '../enums/auth-strategy.enum';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(AuthStrategyEnum.JwtRefresh) {}
