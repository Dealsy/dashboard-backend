import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  UseFilters,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { DashboardService } from 'src/services/dashboard/dashboard.service';
import { USER_ROLES } from 'src/constants';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

type DashboardResponse<T> = {
  data: T;
  error?: string;
};

@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(HttpExceptionFilter)
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  async getDashboardSummary(): Promise<
    DashboardResponse<{
      totalSales: number;
      totalInventoryValue: number;
      totalMaintenanceCosts: number;
      totalMotorbikes: number;
    }>
  > {
    try {
      const data = await this.dashboardService.getDashboardSummary();
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch dashboard summary:', error);
      throw new InternalServerErrorException(
        'Failed to fetch dashboard summary',
      );
    }
  }

  @Get('sales-trends')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  async getSalesTrends(): Promise<
    DashboardResponse<
      {
        date: string;
        totalSales: number;
        count: number;
      }[]
    >
  > {
    try {
      const data = await this.dashboardService.getSalesTrends();
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch sales trends:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch sales trends',
      );
    }
  }

  @Get('inventory-by-category')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  async getInventoryByCategory(): Promise<
    DashboardResponse<
      {
        category: string;
        count: number;
        value: number;
      }[]
    >
  > {
    try {
      const data = await this.dashboardService.getInventoryByCategory();
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch inventory by category:', error);
      throw new InternalServerErrorException(
        'Failed to fetch inventory by category',
      );
    }
  }

  @Get('maintenance-costs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(USER_ROLES.ADMIN)
  async getMaintenanceCosts(): Promise<
    DashboardResponse<
      {
        serviceType: string;
        totalCost: number;
        count: number;
      }[]
    >
  > {
    try {
      const data = await this.dashboardService.getMaintenanceCosts();
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch maintenance costs:', error);
      throw new InternalServerErrorException(
        'Failed to fetch maintenance costs',
      );
    }
  }
}
