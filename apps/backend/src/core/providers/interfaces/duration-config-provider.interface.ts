export interface IDurationConfigProvider {
  getDuration(key: string, defaultValue: string): number;
  getExpiryDate(key: string, defaultValue: string): Date;
}
