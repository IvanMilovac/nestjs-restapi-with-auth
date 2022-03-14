import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { Tokens } from './types';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUpLocal(dto: CreateUserDto): Promise<Tokens> {
    const user = await this.userService.createUser(dto);
    const { email, id } = user;
    const tokens = await this.signTokens(email, id);
    await this.updateHashRt(id, tokens.refresh_token);
    return tokens;
  }

  async signInLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.userService.getUserByEmail(dto.email);
    const { hash, id } = user;
    const { email, password } = dto;
    if (!(await this.verifyHash(hash, password))) {
      throw new ForbiddenException('Wrong credentials');
    }
    const tokens = await this.signTokens(email, id);
    await this.updateHashRt(id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.userService.updateUsers(
      userId,
      { hashRt: null },
      { hashRt: { not: null } },
    );
  }

  async refreshToken(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userService.getUsers(String(userId));
    if (!user || !user.hashRt) throw new ForbiddenException();

    const rtMatch = await argon.verify(user.hashRt, rt);
    if (!rtMatch) throw new ForbiddenException();

    const tokens = await this.signTokens(user.email, userId);
    await this.updateHashRt(userId, tokens.refresh_token);
    return tokens;
  }

  async signTokens(email: string, userId: number): Promise<Tokens> {
    const payload = { sub: userId, email };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_RT_SECRET'),
        expiresIn: '7 days',
      }),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  async updateHashRt(userId: number, rt: string): Promise<void> {
    const hashRt = await argon.hash(rt);
    await this.userService.updateUsers(userId, { hashRt });
  }

  async verifyHash(hash: string, value: string): Promise<boolean> {
    return await argon.verify(hash, value);
  }
}
