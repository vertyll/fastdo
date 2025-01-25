import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ParseIntPipe } from './parse-int.pipe';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('ParseIntPipe', () => {
  let pipe: ParseIntPipe;
  let mockI18nContext: jest.Mocked<I18nContext>;

  beforeEach(() => {
    mockI18nContext = {
      translate: jest.fn().mockReturnValue('Must be an integer'),
    } as any;
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18nContext);
    pipe = new ParseIntPipe();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully parse a valid integer string', () => {
    expect(pipe.transform('123', {} as ArgumentMetadata)).toBe(123);
  });

  it('should throw BadRequestException with translated message for non-integer string', () => {
    mockI18nContext.translate.mockReturnValue('Must be an integer');

    expect(() => pipe.transform('abc', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Must be an integer'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isInteger');
  });

  it('should throw BadRequestException with translated message for float string', () => {
    mockI18nContext.translate.mockReturnValue('Must be an integer');

    expect(() => pipe.transform('123.45', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Must be an integer'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isInteger');
  });

  it('should return the same number for integer input', () => {
    expect(pipe.transform(456, {} as ArgumentMetadata)).toBe(456);
  });

  it('should throw BadRequestException with translated message for non-integer number', () => {
    mockI18nContext.translate.mockReturnValue('Must be an integer');

    expect(() => pipe.transform(123.45, {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Must be an integer'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isInteger');
  });

  it('should throw BadRequestException when translation context is not available', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);

    expect(() => pipe.transform('123', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Translation context is not available'));
  });
});
