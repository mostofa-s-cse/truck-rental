-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `cancelComment` VARCHAR(191) NULL,
    ADD COLUMN `cancelReason` VARCHAR(191) NULL,
    ADD COLUMN `cancelledAt` DATETIME(3) NULL;
