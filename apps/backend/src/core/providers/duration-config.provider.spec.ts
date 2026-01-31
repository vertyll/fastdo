import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nContext } from 'nestjs-i18n';
import { DurationPipe } from '../../common/pipes/duration.pipe';
import { ExpiryDatePipe } from '../../common/pipes/expiry-date.pipe';
import { DurationConfigProvider } from './duration-config.provider';

jest.mock('../../common/pipes/duration.pipe');
jest.mock('../../common/pipes/expiry-date.pipe');
jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('DurationConfigProvider', () => {
  let provider: DurationConfigProvider;
  let configService: jest.Mocked<ConfigService>;
  let mockI18nContext: jest.Mocked<I18nContext>;
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  beforeEach(async () => {
    mockI18nContext = {
      translate: jest.fn().mockReturnValue('Invalid duration'),
    } as any;
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18nContext);

    (DurationPipe as jest.Mock).mockImplementation(() => ({
      transform: jest.fn((value: string) => {
        switch (value) {
          case '5m':
            return 300000;
          case '1m':
            return 60000;
          case '1h':
            return 3600000;
          case '30m':
            return 1800000;
          case '':
          case null:
          case undefined:
            return null;
          default:
            return null;
        }
      }),
    }));

    (ExpiryDatePipe as jest.Mock).mockImplementation(() => ({
      transform: jest.fn((value: string) => {
        switch (value) {
          case '1h':
            return new Date('2024-01-01T01:00:00.000Z');
          case '30m':
            return new Date('2024-01-01T00:30:00.000Z');
          case '1m':
            return new Date('2024-01-01T00:01:00.000Z');
          case '':
          case null:
          case undefined:
            return null;
          default:
            return mockDate;
        }
      }),
    }));

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DurationConfigProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<DurationConfigProvider>(DurationConfigProvider);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('getDuration', () => {
    it('should return duration from config when available', () => {
      configService.get.mockReturnValue('5m');

      const result = provider.getDuration('some.key', '1m');

      expect(result).toBe(300000);
      expect(configService.get).toHaveBeenCalledWith('some.key');
    });

    it('should return duration from default value when config is not available', () => {
      configService.get.mockReturnValue(undefined);

      const result = provider.getDuration('some.key', '1m');

      expect(result).toBe(60000);
      expect(configService.get).toHaveBeenCalledWith('some.key');
    });

    it('should return 0 when both config and default values are invalid', () => {
      configService.get.mockReturnValue('invalid');

      const result = provider.getDuration('some.key', 'also-invalid');

      expect(result).toBe(0);
    });
  });

  describe('getExpiryDate', () => {
    it('should return expiry date from config when available', () => {
      configService.get.mockReturnValue('1h');

      const result = provider.getExpiryDate('some.key', '30m');

      expect(result).toEqual(new Date('2024-01-01T01:00:00.000Z'));
      expect(configService.get).toHaveBeenCalledWith('some.key');
    });

    it('should return expiry date from default value when config is not available', () => {
      configService.get.mockReturnValue(undefined);

      const result = provider.getExpiryDate('some.key', '30m');

      expect(result).toEqual(new Date('2024-01-01T00:30:00.000Z'));
      expect(configService.get).toHaveBeenCalledWith('some.key');
    });

    it('should return current date when both config and default values are invalid', () => {
      configService.get.mockReturnValue('invalid');

      const result = provider.getExpiryDate('some.key', 'also-invalid');

      expect(result).toEqual(mockDate);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      configService.get.mockReturnValue('');

      const durationResult = provider.getDuration('some.key', '1m');
      const expiryResult = provider.getExpiryDate('some.key', '1m');

      expect(durationResult).toBe(60000);
      expect(expiryResult).toEqual(new Date('2024-01-01T00:01:00.000Z'));
    });

    it('should handle null values', () => {
      configService.get.mockReturnValue(null);

      const durationResult = provider.getDuration('some.key', '1m');
      const expiryResult = provider.getExpiryDate('some.key', '1m');

      expect(durationResult).toBe(60000);
      expect(expiryResult).toEqual(new Date('2024-01-01T00:01:00.000Z'));
    });

    it('should handle invalid durations', () => {
      configService.get.mockReturnValue('invalid');

      const durationResult = provider.getDuration('some.key', '1m');
      const expiryResult = provider.getExpiryDate('some.key', '1m');

      expect(durationResult).toBe(60000);
      expect(expiryResult).toEqual(mockDate);
    });
  });
});
