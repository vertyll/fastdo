import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  urgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  projectId?: number;
}
