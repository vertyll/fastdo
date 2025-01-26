import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  it('should set metadata with isPublic key and true value', () => {
    Public();
    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });

  it('should export correct IS_PUBLIC_KEY value', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
