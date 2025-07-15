import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenCookieConfig, SecurityConfig } from './types/app.config.type';

@Injectable()
export class CookieConfigService {
  constructor(private configService: ConfigService) {}

  private getCookieConfig(): SecurityConfig {
    return this.configService.getOrThrow<SecurityConfig>('app.security');
  }

  public getRefreshTokenConfig(): RefreshTokenCookieConfig {
    return this.getCookieConfig().cookie.refreshToken;
  }

  public getClearCookieConfig(): Pick<RefreshTokenCookieConfig, 'path' | 'domain'> {
    const { path, domain } = this.getCookieConfig().cookie.refreshToken;
    return { path, domain };
  }
}
