-- CreateTable
CREATE TABLE "McpSession" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "McpSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McpSession_apiKey_idx" ON "McpSession"("apiKey");
