import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

describe('JwtRefreshAuthGuard', () => {
  let guard: JwtRefreshAuthGuard;

  beforeEach(() => {
    guard = new JwtRefreshAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt-refresh strategy', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt-refresh'));
  });
});
