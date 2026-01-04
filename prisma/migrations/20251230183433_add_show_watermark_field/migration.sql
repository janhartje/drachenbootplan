/*
  Warnings:

  - You are about to drop the column `hideProBadge` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "hideProBadge",
ADD COLUMN     "showProBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showWatermark" BOOLEAN NOT NULL DEFAULT true;
