import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { DurationPipe } from '../pipes/duration.pipe';

export const Duration = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (data: string, _ctx: ExecutionContext) => {
    return new DurationPipe().transform(data, { type: 'param', metatype: String, data: '' });
  },
);
