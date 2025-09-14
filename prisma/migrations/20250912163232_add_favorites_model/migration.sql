/*
  Warnings:

  - The `priority` column on the `Area` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `type` to the `Archive` table without a default value. This is not possible if the table is not empty.
  - Made the column `originalId` on table `Archive` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "public"."Energy" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."Context" AS ENUM ('HOME', 'COMPUTER', 'CALLS', 'ERRANDS');

-- CreateEnum
CREATE TYPE "public"."ArchiveType" AS ENUM ('PROJECT', 'AREA', 'RESOURCE', 'TASK');

-- CreateEnum
CREATE TYPE "public"."FavoriteType" AS ENUM ('PROJECT', 'AREA', 'TASK');

-- AlterTable
ALTER TABLE "public"."Archive" ADD COLUMN     "archivedData" JSONB,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."ArchiveType" NOT NULL,
ALTER COLUMN "originalId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Area" DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'P2';

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "areaId" INTEGER,
ADD COLUMN     "priority" "public"."Priority",
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "context" "public"."Context",
ADD COLUMN     "energy" "public"."Energy",
ADD COLUMN     "notes" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO',
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."Priority";

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "itemType" "public"."FavoriteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_itemId_itemType_key" ON "public"."Favorite"("userId", "itemId", "itemType");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
