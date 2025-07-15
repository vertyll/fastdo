import { FastifyRequest } from 'fastify';
import { User } from '../../users/entities/user.entity';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';

export interface IJwtRefreshStrategy {
  validate(request: FastifyRequest, payload: JwtRefreshPayload): Promise<User>;
}
