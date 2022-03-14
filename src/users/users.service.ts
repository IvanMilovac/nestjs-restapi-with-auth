import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Prisma } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const hash = await argon.hash(password);
    const newUser = { hash, ...rest };
    try {
      const user = await this.prisma.user.create({ data: newUser });
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          return new ForbiddenException('Credentials in use');
      }
      return error;
    }
  }

  async getUsers(userId: string): Promise<any> {
    try {
      if (!userId)
        return await this.prisma.user.findMany({
          select: { id: true, email: true },
        });
      if (isNaN(Number(userId))) {
        throw new BadRequestException(
          'Passed value is not a number or string number',
        );
      }
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, email: true, hashRt: true },
      });
      if (!user) throw new BadRequestException("User ID doesn't exist");
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new ForbiddenException("Email doesn't exist in database");
    return user;
  }

  async updateUsers(userId: number, data: Prisma.UserUpdateInput, where?: any) {
    await this.prisma.user.updateMany({
      where: { id: userId, ...where },
      data: { ...data },
    });
  }
}
