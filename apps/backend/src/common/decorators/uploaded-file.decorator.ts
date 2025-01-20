import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UploadedFile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.incomingFile;
  },
);
