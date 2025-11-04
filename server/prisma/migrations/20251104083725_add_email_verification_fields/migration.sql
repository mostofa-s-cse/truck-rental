-- AlterTable
ALTER TABLE `drivers` ADD COLUMN `truckImage` VARCHAR(191) NULL,
    ADD COLUMN `truckImages` JSON NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerifyExpiry` DATETIME(3) NULL,
    ADD COLUMN `emailVerifyToken` VARCHAR(191) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false;
