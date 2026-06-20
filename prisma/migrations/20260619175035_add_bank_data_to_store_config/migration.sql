-- AlterTable
ALTER TABLE `store_config` ADD COLUMN `accountNumber` VARCHAR(11) NULL,
    ADD COLUMN `bankName` VARCHAR(100) NULL,
    MODIFY `qrCodeUrl` VARCHAR(500) NULL;
