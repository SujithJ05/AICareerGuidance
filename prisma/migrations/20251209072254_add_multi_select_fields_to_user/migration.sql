/*
  Warnings:

  - The `industry` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_industry_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "specializations" TEXT[],
DROP COLUMN "industry",
ADD COLUMN     "industry" TEXT[];
