import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  //sign up
  async signup(username: string, password: string, email: string) {
    const hashedPassword: string = await this.hashPassword(password);
    const newUser = await this.usersService.createUser(
      username,
      email,
      hashedPassword,
    );
    return { message: 'User registered successfully', userId: newUser.id };
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      throw new Error(
        `Hashing password failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
  //login
  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //Check Password validation
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    //Create JWT token
    const payload = { userId: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
