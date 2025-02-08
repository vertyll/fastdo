import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DurationPipe } from '../../common/pipes/duration.pipe';
import { ExpiryDatePipe } from '../../common/pipes/expiry-date.pipe';
import { IDurationConfigProvider } from './interfaces/duration-config-provider.interface';

@Injectable()
export class DurationConfigProvider implements IDurationConfigProvider {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  private transform<T>(pipe: PipeTransform, value: string, defaultValue: string, fallback: T): T {
    const valueToTransform = this.configService.get<string>(value) || defaultValue;
    const result = pipe.transform(valueToTransform, { type: 'custom', metatype: String, data: '' });

    if (result === null) {
      return pipe.transform(defaultValue, { type: 'custom', metatype: String, data: '' }) ?? fallback;
    }

    return result as T;
  }

  getDuration(key: string, defaultValue: string): number {
    return this.transform(new DurationPipe(), key, defaultValue, 0);
  }

  getExpiryDate(key: string, defaultValue: string): Date {
    return this.transform(new ExpiryDatePipe(), key, defaultValue, new Date());
  }
}
