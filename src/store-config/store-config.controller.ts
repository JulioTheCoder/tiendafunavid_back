import {
  Controller,
  Get,
  Patch,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { StoreConfigService } from './store-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('store-config')
export class StoreConfigController {
  constructor(
    private readonly storeConfigService: StoreConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('qr')
  getQrCode() {
    return this.storeConfigService.getQrCode();
  }

  @Patch('qr')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadQr(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(
      file,
      'tiendafunavid/qr',
    );
    return this.storeConfigService.updateQrCode(result.url);
  }
}
