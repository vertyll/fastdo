export interface ISeederLogger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}
