import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Protocol = createParamDecorator((_defaultValue: string, ctx: ExecutionContext) => {
  // console.log('defaultValue', defaultValue);
  const request = ctx.switchToHttp().getRequest();
  return request.protocol;
});
