import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

type DashboardSummary = {
  totalSales: number;
  totalInventoryValue: number;
  totalMaintenanceCosts: number;
  totalMotorbikes: number;
};

type SalesTrend = {
  date: string;
  totalSales: number;
  count: number;
};

type InventoryByCategory = {
  category: string;
  count: number;
  value: number;
};

type MaintenanceCost = {
  serviceType: string;
  totalCost: number;
  count: number;
};

type AggregateResult = {
  _sum: Record<string, number | null>;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async getSalesTotalAmount() {
    const result = await this.prisma.$queryRaw<AggregateResult[]>`
      SELECT SUM("salePrice") as "_sum__salePrice"
      FROM "Sale"
    `;
    return Number(result[0]?._sum?.salePrice ?? 0);
  }

  private async getInventoryTotalValue() {
    const result = await this.prisma.$queryRaw<AggregateResult[]>`
      SELECT SUM(i.quantity * m.price) as "_sum__value"
      FROM "Inventory" i
      JOIN "Motorbike" m ON m.id = i."motorbikeId"
    `;
    return Number(result[0]?._sum?.value ?? 0);
  }

  private async getMaintenanceTotalCost() {
    const result = await this.prisma.$queryRaw<AggregateResult[]>`
      SELECT SUM(cost) as "_sum__cost"
      FROM "Maintenance"
    `;
    return Number(result[0]?._sum?.cost ?? 0);
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [
      totalSales,
      totalInventoryValue,
      totalMaintenanceCosts,
      totalMotorbikes,
    ] = await Promise.all([
      this.getSalesTotalAmount(),
      this.getInventoryTotalValue(),
      this.getMaintenanceTotalCost(),
      this.prisma.motorbike.count(),
    ]);

    return {
      totalSales,
      totalInventoryValue,
      totalMaintenanceCosts,
      totalMotorbikes,
    };
  }

  async getSalesTrends(): Promise<SalesTrend[]> {
    try {
      const sales = await this.prisma.$queryRaw<
        Array<{
          saleDate: Date;
          _sum_salePrice: number | null;
          count: number;
        }>
      >`
        SELECT 
          DATE_TRUNC('day', "saleDate") as "saleDate",
          SUM("salePrice") as "_sum_salePrice",
          COUNT(*) as "count"
        FROM "Sale"
        GROUP BY DATE_TRUNC('day', "saleDate")
        ORDER BY DATE_TRUNC('day', "saleDate") ASC
      `;

      if (!Array.isArray(sales)) {
        console.error('Expected sales to be an array but got:', sales);
        throw new Error('Invalid sales data format');
      }

      return sales.map((sale) => {
        const saleDate =
          sale.saleDate instanceof Date
            ? sale.saleDate.toISOString().split('T')[0]
            : new Date(sale.saleDate).toISOString().split('T')[0];

        return {
          date: saleDate,
          totalSales: Number(sale._sum_salePrice ?? 0),
          count: Number(sale.count),
        };
      });
    } catch (error) {
      console.error('Error in getSalesTrends:', error);
      throw error;
    }
  }

  async getInventoryByCategory(): Promise<InventoryByCategory[]> {
    try {
      const inventory = await this.prisma.$queryRaw<
        Array<{
          category: string;
          count: number;
          total_value: number | null;
        }>
      >`
        SELECT 
          m.category,
          COUNT(*) as "count",
          SUM(i.quantity * m.price) as "total_value"
        FROM "Motorbike" m
        JOIN "Inventory" i ON i."motorbikeId" = m.id
        GROUP BY m.category
      `;

      if (!Array.isArray(inventory)) {
        console.error('Expected inventory to be an array but got:', inventory);
        throw new Error('Invalid inventory data format');
      }

      return inventory.map((item) => ({
        category: String(item.category),
        count: Number(item.count),
        value: Number(item.total_value ?? 0),
      }));
    } catch (error) {
      console.error('Error in getInventoryByCategory:', error);
      throw error;
    }
  }

  async getMaintenanceCosts(): Promise<MaintenanceCost[]> {
    try {
      const maintenance = await this.prisma.$queryRaw<
        Array<{
          serviceType: string;
          total_cost: number | null;
          count: number;
        }>
      >`
        SELECT 
          "serviceType",
          SUM(cost) as "total_cost",
          COUNT(*) as "count"
        FROM "Maintenance"
        GROUP BY "serviceType"
      `;

      if (!Array.isArray(maintenance)) {
        console.error(
          'Expected maintenance to be an array but got:',
          maintenance,
        );
        throw new Error('Invalid maintenance data format');
      }

      return maintenance.map((item) => ({
        serviceType: String(item.serviceType),
        totalCost: Number(item.total_cost ?? 0),
        count: Number(item.count),
      }));
    } catch (error) {
      console.error('Error in getMaintenanceCosts:', error);
      throw error;
    }
  }
}
