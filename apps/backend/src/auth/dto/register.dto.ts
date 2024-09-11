import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ description: "E-mail address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password" })
  @IsString()
  @MinLength(6)
  password: string;
}
