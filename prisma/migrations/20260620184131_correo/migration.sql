-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customerEmail` VARCHAR(255) NULL,
    ADD COLUMN `customerName` VARCHAR(255) NULL,
    ADD COLUMN `customerPhone` VARCHAR(50) NULL,
    ADD COLUMN `shippingAddress` TEXT NULL,
    ADD COLUMN `shippingCity` VARCHAR(100) NULL,
    ADD COLUMN `shippingPostalCode` VARCHAR(20) NULL;
