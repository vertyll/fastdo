import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: "Name is too short, minimum 3 characters" })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  projectId?: number;
}
