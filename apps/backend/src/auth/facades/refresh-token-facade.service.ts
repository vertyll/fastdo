import { Injectable } from '@nestjs/common';
import { IRefreshTokenFacade } from '../interfaces/refresh-token-facade.interface';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenFacadeService implements IRefreshTokenFacade {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  public async deleteAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenService.deleteAllUserTokens(userId);
  }
}
