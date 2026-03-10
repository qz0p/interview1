/*
  Warnings:

  - You are about to drop the column `activities` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `className` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regret` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Application_studentId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "activities",
DROP COLUMN "plan",
DROP COLUMN "studentId",
ADD COLUMN     "className" TEXT NOT NULL,
ADD COLUMN     "goal" TEXT NOT NULL,
ADD COLUMN     "project" TEXT NOT NULL,
ADD COLUMN     "regret" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Application_phone_key" ON "Application"("phone");
