import { Module } from '@nestjs/common';
import { MotorbikesController } from './motorbikes.controller';
import { MotorbikesService } from 'src/services/motorbikes/motorbikes.service';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [MotorbikesController],
  providers: [MotorbikesService, PrismaService],
})
export class MotorbikesModule {}
