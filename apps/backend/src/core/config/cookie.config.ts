import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenCookieConfig, SecurityConfig } from './types/app.config.type';

@Injectable()
export class CookieConfigService {
  constructor(private configService: ConfigService) {}

  private getCookieConfig() {
    return this.configService.getOrThrow<SecurityConfig>('app.security');
  }

  public getRefreshTokenConfig(): RefreshTokenCookieConfig {
    return this.getCookieConfig().cookie.refreshToken;
  }

  public getClearCookieConfig(): Pick<RefreshTokenCookieConfig, 'path'> {
    return {
      path: this.getCookieConfig().cookie.refreshToken.path,
    };
  }
}
