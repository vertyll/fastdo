import { Environment } from '../../core/config/types/app.config.type';
import { SEEDER_CONFIG_KEY, Seeder } from './seeder.decorator';

describe('Seeder Decorator', () => {
  const getMetadata = (target: any) => {
    return Reflect.getMetadata(SEEDER_CONFIG_KEY, target);
  };

  it('should set default values when no config provided', () => {
    @Seeder()
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata).toEqual({
      environment: [],
      truncate: false,
      priority: 100,
    });
  });

  it('should set provided environment values', () => {
    @Seeder({
      environment: [Environment.DEVELOPMENT, Environment.PRODUCTION],
    })
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata.environment).toEqual([
      Environment.DEVELOPMENT,
      Environment.PRODUCTION,
    ]);
    expect(metadata.truncate).toBeFalsy();
    expect(metadata.priority).toBe(100);
  });

  it('should set provided truncate value', () => {
    @Seeder({
      truncate: true,
    })
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata.environment).toEqual([]);
    expect(metadata.truncate).toBeTruthy();
    expect(metadata.priority).toBe(100);
  });

  it('should set provided priority value', () => {
    @Seeder({
      priority: 1,
    })
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata.environment).toEqual([]);
    expect(metadata.truncate).toBeFalsy();
    expect(metadata.priority).toBe(1);
  });

  it('should set all provided values', () => {
    @Seeder({
      environment: [Environment.DEVELOPMENT],
      truncate: true,
      priority: 50,
    })
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata).toEqual({
      environment: [Environment.DEVELOPMENT],
      truncate: true,
      priority: 50,
    });
  });

  it('should not affect class methods or properties', () => {
    @Seeder({
      priority: 1,
    })
    class TestSeeder {
      public testProperty = 'test';
      public testMethod() {
        return 'test';
      }
    }

    const instance = new TestSeeder();

    expect(instance.testProperty).toBe('test');
    expect(instance.testMethod()).toBe('test');
  });

  it('should handle empty objects', () => {
    @Seeder({})
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata).toEqual({
      environment: [],
      truncate: false,
      priority: 100,
    });
  });

  it('should handle undefined values', () => {
    @Seeder({
      environment: undefined,
      truncate: undefined,
      priority: undefined,
    })
    class TestSeeder {}

    const metadata = getMetadata(TestSeeder);

    expect(metadata).toEqual({
      environment: [],
      truncate: false,
      priority: 100,
    });
  });
});
