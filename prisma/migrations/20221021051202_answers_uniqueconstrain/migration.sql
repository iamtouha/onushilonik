/*
  Warnings:

  - A unique constraint covering the columns `[answerSheetId,questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Answer_answerSheetId_questionId_key` ON `Answer`(`answerSheetId`, `questionId`);
