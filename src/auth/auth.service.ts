import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: number) {
    return this.usersService.findById(userId);
  }

  private revokedToken: Set<string> = new Set();

  async logout(token: string){
    this.revokedToken.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedToken.has(token);
  }

  //sign up
  async signup(
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    email: string,
  ) {
    const hashedPassword: string = await this.hashPassword(password);
    const newUser = await this.usersService.createUser(
      firstname,
      lastname,
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
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  //forgot password
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //Create a token reset
    const resetToken = randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = new Date(Date.now() + 3600000);

    await this.userRepository.save(user);

    //Ethereal Email profile
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'camryn.goyette76@ethereal.email',
        pass: 'mAvE3Kj77jP8bGvkGU',
      },
    });

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: '"Support" <camryn.goyette76@ethereal.email>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link: ${resetLink}`,
    });

    return { message: 'Password reset token sent to email' };
  }

  //Reset password
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });

    if (
      !user ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    // New password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }
}
