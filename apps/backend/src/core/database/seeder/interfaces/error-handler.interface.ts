export interface ISeederErrorHandler {
  handle(error: Error): Promise<void>;
}
