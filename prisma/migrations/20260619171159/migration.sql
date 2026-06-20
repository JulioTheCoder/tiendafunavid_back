-- AlterTable
ALTER TABLE `payment_proofs` MODIFY `imageUrl` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `store_config` MODIFY `qrCodeUrl` TEXT NULL;
