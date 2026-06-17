import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getQrCode() {
    let config = await this.prisma.storeConfig.findFirst();

    if (!config) {
      config = await this.prisma.storeConfig.create({
        data: {},
      });
    }

    return { qrCodeUrl: config.qrCodeUrl };
  }

  async updateQrCode(qrCodeUrl: string) {
    let config = await this.prisma.storeConfig.findFirst();

    if (!config) {
      config = await this.prisma.storeConfig.create({
        data: { qrCodeUrl },
      });
    } else {
      config = await this.prisma.storeConfig.update({
        where: { id: config.id },
        data: { qrCodeUrl },
      });
    }

    return { qrCodeUrl: config.qrCodeUrl };
  }
}
