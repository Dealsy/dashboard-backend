import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserInterface } from 'src/interfaces/user.interface';
import { UsersService } from 'src/services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() user: UserInterface): UserInterface {
    this.usersService.create(user);
    return user;
  }

  @Get()
  getUsers() {
    return {
      message: 'Users fetched successfully',
      users: this.usersService.findAll(),
    };
  }
}
