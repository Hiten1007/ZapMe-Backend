/*
  Warnings:

  - You are about to drop the column `groupName` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isGroup` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "groupName",
DROP COLUMN "isGroup";
