-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initialCapital" REAL NOT NULL,
    "currentCapital" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "reinvestmentType" TEXT NOT NULL DEFAULT 'COMPOUND',
    "rateType" TEXT NOT NULL DEFAULT 'ANNUAL'
);
INSERT INTO "new_Investment" ("createdAt", "currentCapital", "id", "initialCapital", "interestRate", "name", "reinvestmentType", "startDate", "type", "updatedAt") SELECT "createdAt", "currentCapital", "id", "initialCapital", "interestRate", "name", "reinvestmentType", "startDate", "type", "updatedAt" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MonthlyInterest_investmentId_idx" ON "MonthlyInterest"("investmentId");
