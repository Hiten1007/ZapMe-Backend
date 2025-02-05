-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" TEXT NOT NULL DEFAULT 'Zap me a message!',
ADD COLUMN     "attributes" TEXT[];
