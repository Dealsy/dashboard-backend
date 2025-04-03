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
import { UsersService } from 'src/services/users/users.service';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { UserEntity } from 'src/dto/user.dto';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { USER_MESSAGES } from 'src/constants';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    const createdUser = await this.usersService.create(user);
    return {
      message: USER_MESSAGES.USER_CREATED,
      user: new UserEntity(createdUser),
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getUsers() {
    const users = await this.usersService.findAll();
    return {
      message: USER_MESSAGES.USERS_FETCHED,
      users: users.map((user) => new UserEntity(user)),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('self')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      message: USER_MESSAGES.USER_FETCHED,
      user: new UserEntity(user),
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'self')
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.usersService.delete(id);
    return {
      message: USER_MESSAGES.USER_DELETED,
      user: new UserEntity(deletedUser),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('self')
  async updateUser(
    @Param('id') id: string,
    @Body() user: Partial<UserInterface>,
  ) {
    const updatedUser = await this.usersService.update(id, user);
    return {
      message: USER_MESSAGES.USER_UPDATED,
      user: new UserEntity(updatedUser),
    };
  }
}
