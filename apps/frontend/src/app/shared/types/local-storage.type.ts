/*
 * Interface
 */
export interface ILocalStorage {
  get<T>(key: string, defaultValue: T): T;

  set<T>(key: string, value: T): void;

  remove(key: string): void;

  clear(): void;

  exists(key: string): boolean;
}
