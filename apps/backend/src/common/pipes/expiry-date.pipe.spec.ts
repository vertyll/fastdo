import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { DurationPipe } from './duration.pipe';
import { ExpiryDatePipe } from './expiry-date.pipe';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

jest.mock('./duration.pipe');

describe('ExpiryDatePipe', () => {
  let pipe: ExpiryDatePipe;
  let mockI18nContext: jest.Mocked<I18nContext>;
  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    mockI18nContext = {
      translate: jest.fn().mockReturnValue('Invalid duration'),
    } as any;
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18nContext);

    (DurationPipe as jest.Mock).mockImplementation(() => ({
      transform: jest.fn((value: string) => {
        if (value === '1h') return 3600000;
        if (value === '0h') return 0;
        if (value === 'invalid') return null;
        return null;
      }),
    }));

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    pipe = new ExpiryDatePipe();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should successfully transform valid duration to future date', () => {
    const result = pipe.transform('1h', {} as ArgumentMetadata);
    expect(result).toEqual(new Date('2024-01-01T01:00:00.000Z'));
  });

  it('should return null for empty value', () => {
    expect(pipe.transform('', {} as ArgumentMetadata)).toBeNull();
  });

  it('should throw BadRequestException when DurationPipe returns null', () => {
    mockI18nContext.translate.mockReturnValue('Invalid duration');

    expect(() => pipe.transform('invalid', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isDuration');
  });

  it('should throw BadRequestException when DurationPipe returns zero or negative', () => {
    mockI18nContext.translate.mockReturnValue('Invalid duration');

    expect(() => pipe.transform('0h', {} as ArgumentMetadata))
      .toThrow(new BadRequestException('Invalid duration'));

    expect(mockI18nContext.translate)
      .toHaveBeenCalledWith('messages.Validation.isDuration');
  });

  it('should throw Error when translation context is not available', () => {
    (I18nContext.current as jest.Mock).mockReturnValue(null);

    expect(() => pipe.transform('1h', {} as ArgumentMetadata))
      .toThrow(new Error('I18nContext not available'));
  });
});
