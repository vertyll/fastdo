import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ExpiryDatePipe } from '../pipes/expiry-date.pipe';

export const ExpiryDate = createParamDecorator((data: string, _ctx: ExecutionContext) => {
  return new ExpiryDatePipe().transform(data, { type: 'param', metatype: String, data: '' });
});
