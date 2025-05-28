-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initialCapital" REAL NOT NULL,
    "currentCapital" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "reinvestmentType" TEXT NOT NULL DEFAULT 'COMPOUND'
);

-- CreateTable
CREATE TABLE "MonthlyInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "month" DATETIME NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" DATETIME,
    "reinvested" BOOLEAN NOT NULL DEFAULT false,
    "investmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyInterest_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyInterest_investmentId_month_key" ON "MonthlyInterest"("investmentId", "month");
