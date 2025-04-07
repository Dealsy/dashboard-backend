import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard.module';
import { MotorbikesModule } from './routes/motorbikes/motorbikes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    DashboardModule,
    MotorbikesModule,
  ],
})
export class AppModule {}
