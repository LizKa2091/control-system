-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('planned', 'in_progress', 'completed');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'planned';
