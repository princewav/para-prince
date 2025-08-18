-- AlterTable
ALTER TABLE "public"."Area" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 2;
