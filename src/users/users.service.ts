import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly useRespository: Repository<User>,
  ) {}

  async createUser(
    username: string,
    password: string,
    email: string,
  ): Promise<User> {
    const newUser = this.useRespository.create({ username, password, email });
    return await this.useRespository.save(newUser);
  }

  async getAllUser(): Promise<User[]> {
    return this.useRespository.find();
  }
}
