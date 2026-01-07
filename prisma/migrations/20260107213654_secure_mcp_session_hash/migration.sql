/*
  Warnings:

  - You are about to drop the column `apiKey` on the `McpSession` table. All the data in the column will be lost.
  - Added the required column `api_key_hash` to the `McpSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "McpSession_apiKey_idx";

-- AlterTable
ALTER TABLE "McpSession" DROP COLUMN "apiKey",
ADD COLUMN     "api_key_hash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "McpSession_api_key_hash_idx" ON "McpSession"("api_key_hash");
