import { Module } from '@nestjs/common';
import { StoreConfigController } from './store-config.controller';
import { StoreConfigService } from './store-config.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [StoreConfigService],
  controllers: [StoreConfigController],
  exports: [StoreConfigService],
})
export class StoreConfigModule {}
