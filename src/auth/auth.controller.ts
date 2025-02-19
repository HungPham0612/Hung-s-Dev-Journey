import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //endpoint for signup
  @Post('signup')
  async signup(
    @Body() body: { username: string; password: string; email: string },
  ) {
    return this.authService.signup(body.username, body.password, body.email);
  }

  //endpoint for login
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
