import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  getUsers(@Query('userId') userId: string) {
    return this.users.getUsers(userId);
  }
}
