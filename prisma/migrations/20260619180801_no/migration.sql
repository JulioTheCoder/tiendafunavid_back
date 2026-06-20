/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `store_config` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `store_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `store_config` DROP COLUMN `accountNumber`,
    DROP COLUMN `bankName`,
    MODIFY `qrCodeUrl` TEXT NULL;
