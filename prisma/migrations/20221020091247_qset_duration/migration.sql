/*
  Warnings:

  - You are about to drop the column `code` on the `AnswerSheet` table. All the data in the column will be lost.
  - Added the required column `integrityId` to the `AnswerSheet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AnswerSheet_code_key` ON `AnswerSheet`;

-- AlterTable
ALTER TABLE `AnswerSheet` DROP COLUMN `code`,
    ADD COLUMN `integrityId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `QuestionSet` ADD COLUMN `duration` INTEGER NOT NULL DEFAULT 0;
