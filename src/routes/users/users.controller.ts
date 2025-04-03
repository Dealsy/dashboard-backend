import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UserInterface } from 'src/interfaces/user.interface';
import { UsersService } from 'src/services/users.service';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { UserEntity } from 'src/dto/user.dto';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    const createdUser = await this.usersService.create(user);
    return {
      message: 'User created successfully',
      user: new UserEntity(createdUser),
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUsers() {
    const users = await this.usersService.findAll();
    return {
      message: 'Users fetched successfully',
      users: users.map((user) => new UserEntity(user)),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return new UserEntity(user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
      user: new UserEntity(deletedUser),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(
    @Param('id') id: string,
    @Body() user: Partial<UserInterface>,
  ) {
    const updatedUser = await this.usersService.update(id, user);
    return {
      message: 'User updated successfully',
      user: new UserEntity(updatedUser),
    };
  }
}
