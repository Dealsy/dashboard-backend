import { Module } from '@nestjs/common';
import { DashboardController } from '../routes/dashboard/dashboard.controller';
import { DashboardService } from 'src/services/dashboard/dashboard.service';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
