import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "../common/guards/local-auth.guard";
import { Public } from "../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post("register")
  async register(@Body() registerDto: { email: string; password: string }) {
    return this.authService.register(registerDto.email, registerDto.password);
  }
}
