-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_userId_reviewedAt_idx" ON "Review"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "Review_deckId_reviewedAt_idx" ON "Review"("deckId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
