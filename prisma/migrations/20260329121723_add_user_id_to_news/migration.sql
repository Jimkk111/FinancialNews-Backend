-- AlterTable
ALTER TABLE `news` ADD COLUMN `user_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `news_user_id_idx` ON `news`(`user_id`);

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
