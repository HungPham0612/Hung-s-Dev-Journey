import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
}
