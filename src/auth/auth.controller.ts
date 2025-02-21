import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from '@nestjs/common';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //endpoint for signup
  @Post('signup')
  async signup(
    @Body()
    body: {
      firstname: string;
      lastname: string;
      username: string;
      password: string;
      email: string;
    },
  ) {
    return this.authService.signup(
      body.firstname,
      body.lastname,
      body.username,
      body.password,
      body.email,
    );
  }

  //endpoint for login
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  //Protect Route
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }
    const user = await this.authService.getUserProfile(req.user.id);

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };
  }
}
