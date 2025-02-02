import { User } from '../../users/entities/user.entity';
import { JwtRefreshPayload } from './jwt-refresh-payload.interface';

export interface IJwtRefreshStrategy {
  validate(request: any, payload: JwtRefreshPayload): Promise<User>;
}
