import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ParseIntPipe } from './parse-int.pipe';

describe('ParseIntPipe', () => {
  let pipe: ParseIntPipe;

  beforeEach(() => {
    pipe = new ParseIntPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should successfully parse a valid integer string', () => {
    expect(pipe.transform('123', {} as ArgumentMetadata)).toBe(123);
  });

  it('should throw BadRequestException for non-integer string', () => {
    expect(() => pipe.transform('abc', {} as ArgumentMetadata)).toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException for float string', () => {
    expect(() => pipe.transform('123.45', {} as ArgumentMetadata)).toThrow(
      BadRequestException,
    );
  });

  it('should return the same number for integer input', () => {
    expect(pipe.transform(456, {} as ArgumentMetadata)).toBe(456);
  });

  it('should throw BadRequestException for non-integer number', () => {
    expect(() => pipe.transform(123.45, {} as ArgumentMetadata)).toThrow(
      BadRequestException,
    );
  });
});
