import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  public readonly limit: number;

  @IsOptional()
  @IsPositive()
  public readonly offset: number;
}
