import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { MotorbikesService } from 'src/services/motorbikes/motorbikes.service';
import { USER_ROLES } from 'src/constants';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(HttpExceptionFilter)
@Controller('motorbikes')
export class MotorbikesController {
  constructor(private readonly motorbikesService: MotorbikesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  async getAllMotorbikes() {
    const motorbikes = await this.motorbikesService.findAll();
    return {
      data: motorbikes,
    };
  }
}
