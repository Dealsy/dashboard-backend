import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class MotorbikesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const motorbikes = await this.prisma.motorbike.findMany({
        include: {
          inventory: true,
        },
        orderBy: {
          brand: 'asc',
        },
      });

      return motorbikes.map((motorbike) => ({
        id: motorbike.id,
        brand: motorbike.brand,
        model: motorbike.model,
        year: motorbike.year,
        category: motorbike.category,
        engineSize: motorbike.engineSize,
        price: motorbike.price,
        color: motorbike.color,
        inStock: motorbike.inventory?.quantity ?? 0,
        location: motorbike.inventory?.location ?? 'Not in stock',
      }));
    } catch (error) {
      console.error('Error in findAll motorbikes:', error);
      throw error;
    }
  }
}
