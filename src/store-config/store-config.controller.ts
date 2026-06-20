import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoreConfigService } from './store-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('store-config')
export class StoreConfigController {
  constructor(
    private readonly storeConfigService: StoreConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  getConfig() {
    return this.storeConfigService.getConfig();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateConfig(@Body() data: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  }) {
    return this.storeConfigService.updateConfig(data);
  }

  @Patch('qr')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadQr(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No se recibió la imagen del código QR');
    }
    const result = await this.cloudinaryService.uploadImage(file, 'tiendafunavid/qr');
    return this.storeConfigService.updateConfig({ qrCodeUrl: result.url });
  }
}