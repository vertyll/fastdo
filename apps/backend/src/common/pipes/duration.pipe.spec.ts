import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { DurationPipe } from './duration.pipe';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('DurationPipe', () => {
  let pipe: DurationPipe;
  let mockI18nContext: jest.Mocked<I18nContext>;

  beforeEach(() => {
    mockI18nContext = {
      translate: jest.fn().mockReturnValue('Invalid duration'),
    } as any;
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18nContext);
    pipe = new DurationPipe();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully transform valid duration strings', () => {
    expect(pipe.transform('5s', {} as ArgumentMetadata)).toBe(5000);
    expect(pipe.transform('10m', {} as ArgumentMetadata)).toBe(600000);
    expect(pipe.transform('2h', {} as ArgumentMetadata)).toBe(7200000);
    expect(pipe.transform('1d', {} as ArgumentMetadata)).toBe(86400000);
    expect(pipe.transform('1w', {} as ArgumentMetadata)).toBe(604800000);
  });

  it('should return null for empty value', () => {
    expect(pipe.transform('', {} as ArgumentMetadata)).toBeNull();
  });

  it('should throw BadRequestException for invalid format', () => {
    mockI18nContext.translate.mockReturnValue('Invalid duration format');

    expect(() => pipe.transform('abc', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration format'));
    expect(() => pipe.transform('123', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration format'));
    expect(() => pipe.transform('1y', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration format'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isDuration');
  });

  it('should throw BadRequestException for non-positive numbers', () => {
    mockI18nContext.translate.mockReturnValueOnce('Must be positive');
    expect(() => pipe.transform('0s', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Must be positive'));

    mockI18nContext.translate.mockReturnValueOnce('Invalid duration format');
    expect(() => pipe.transform('-5m', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration format'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.mustBePositive');
    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isDuration');
  });

  it('should throw Error when translation context is not available', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);

    expect(() => pipe.transform('5m', {} as ArgumentMetadata))
      .toThrow(new Error('I18nContext not available'));
  });
});
