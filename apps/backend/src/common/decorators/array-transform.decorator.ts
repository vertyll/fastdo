import { Transform } from 'class-transformer';

export function ArrayTransform(): PropertyDecorator {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (value !== undefined && value !== null && value !== '') {
      return [Number(value)];
    }
    return undefined;
  });
}
