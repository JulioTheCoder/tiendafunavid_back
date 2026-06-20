import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    let config = await this.prisma.storeConfig.findFirst();

    if (!config) {
      config = await this.prisma.storeConfig.create({
        data: {},
      });
    }

    return {
      qrCodeUrl: config.qrCodeUrl,
      bankName: config.bankName,
      accountName: config.accountName,
      accountNumber: config.accountNumber,
    };
  }

  async updateConfig(data: {
    qrCodeUrl?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  }) {
    let config = await this.prisma.storeConfig.findFirst();

    if (!config) {
      config = await this.prisma.storeConfig.create({
        data,
      });
    } else {
      config = await this.prisma.storeConfig.update({
        where: { id: config.id },
        data,
      });
    }

    return {
      qrCodeUrl: config.qrCodeUrl,
      bankName: config.bankName,
      accountName: config.accountName,
      accountNumber: config.accountNumber,
    };
  }
}