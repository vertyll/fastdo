import { of } from 'rxjs';
import { SnakeToCamelCaseInterceptor } from './snake-to-camel-case.interceptor';

describe('SnakeToCamelCaseInterceptor', () => {
  let interceptor: SnakeToCamelCaseInterceptor;

  beforeEach(() => {
    interceptor = new SnakeToCamelCaseInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform snake_case to camelCase', () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () =>
        of({
          snake_case: 'value',
          nested_object: { another_key: 'value' },
          date_creation: new Date('2025-01-26T11:03:57.305Z'),
        }),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(result => {
      expect(result).toEqual({
        snakeCase: 'value',
        nestedObject: { anotherKey: 'value' },
        dateCreation: new Date('2025-01-26T11:03:57.305Z'),
      });
    });
  });

  it('should handle arrays', () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () =>
        of([{ snake_case: 'value', date_creation: new Date('2025-01-26T11:03:57.305Z') }, { another_key: 'value' }]),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(result => {
      expect(result).toEqual([
        { snakeCase: 'value', dateCreation: new Date('2025-01-26T11:03:57.305Z') },
        { anotherKey: 'value' },
      ]);
    });
  });

  it('should not modify non-object values', () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () => of('string'),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(result => {
      expect(result).toBe('string');
    });
  });

  it('should handle null and undefined values correctly', () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () =>
        of({
          null_value: null,
          undefined_value: undefined,
        }),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(result => {
      expect(result).toEqual({
        nullValue: null,
        undefinedValue: undefined,
      });
    });
  });
});
