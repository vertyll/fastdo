import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from '../enums/auth-strategy.enum';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategyEnum.Local) {}
