import { Injectable } from '@nestjs/common';
import { ConfirmationTokenService } from '../confirmation-token.service';
import { IConfirmationTokenFacade } from '../interfaces/confirmation-token-facade.interface';

@Injectable()
export class ConfirmationTokenFacadeService implements IConfirmationTokenFacade {
  constructor(private readonly confirmationTokenService: ConfirmationTokenService) {}

  public generateToken(email: string): string {
    return this.confirmationTokenService.generateToken(email);
  }
}
