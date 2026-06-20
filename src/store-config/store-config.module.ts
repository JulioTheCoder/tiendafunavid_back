import { Module } from '@nestjs/common';
import { StoreConfigController } from './store-config.controller';
import { StoreConfigService } from './store-config.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
  ],
  providers: [StoreConfigService],
  controllers: [StoreConfigController],
  exports: [StoreConfigService],
})
export class StoreConfigModule { }