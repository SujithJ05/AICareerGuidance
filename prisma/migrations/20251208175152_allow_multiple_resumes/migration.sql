-- DropIndex
DROP INDEX "public"."Resume_userId_key";

-- AlterTable
ALTER TABLE "public"."IndustryInsight" ALTER COLUMN "demandLevel" SET DEFAULT 'MEDIUM',
ALTER COLUMN "marketOutlook" SET DEFAULT 'NEUTRAL';
