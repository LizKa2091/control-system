-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_defectId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "defectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
