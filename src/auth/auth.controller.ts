import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UnauthorizedException,
  Request,
  Put
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';


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

  //endpoint for update profile
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: { username?: string; email?: string; firstname?: string; lastname?: string},
  ) {
    await this.authService.updateUserProfile(req.user.id, updateUserDto);
    return {message: 'Profile updated successfully'}
  }

  //endpoint for forgot-password
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  //endpoint for reset-password
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  //endpoint for logout 
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req){
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
      return {message: 'No token provide' };
    }
    await this.authService.logout(token);
    return {message: 'User logged out successfully'};
  }
}
