import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ConfirmationTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(email: string): string {
    return this.jwtService.sign(
      { email },
      {
        expiresIn: '24h',
        secret: this.configService.get<string>('app.security.jwt.secret'),
      },
    );
  }

  verifyToken(token: string): { email: string; } {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('app.security.jwt.secret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid confirmation token');
    }
  }
}
