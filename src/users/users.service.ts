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

  async findById(id: number): Promise<User | null> {
    return this.useRespository.findOne({ where: { id } });
  }

  async createUser(
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const newUser = this.useRespository.create({
      firstname,
      lastname,
      username,
      email,
      password,
    });
    return await this.useRespository.save(newUser);
  }

  async getAllUser(): Promise<User[]> {
    return this.useRespository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.useRespository.findOne({ where: { email } });
  }

  async save(user:User): Promise<User>{
    return await this.useRespository.save(user);
  }
}
