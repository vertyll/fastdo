import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ description: "The name of the project" })
  @IsString()
  @MinLength(3, { message: "Name is too short, minimum 3 characters" })
  name: string;
}
