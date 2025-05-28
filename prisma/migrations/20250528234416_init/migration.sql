-- CreateEnum
CREATE TYPE "ReinvestmentType" AS ENUM ('COMPOUND', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "Investment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "initialCapital" DOUBLE PRECISION NOT NULL,
    "currentCapital" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "rateType" "RateType" NOT NULL DEFAULT 'ANNUAL',
    "reinvestmentType" "ReinvestmentType" NOT NULL DEFAULT 'COMPOUND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyInterest" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "reinvested" BOOLEAN NOT NULL DEFAULT false,
    "investmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyInterest_investmentId_idx" ON "MonthlyInterest"("investmentId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyInterest_investmentId_month_key" ON "MonthlyInterest"("investmentId", "month");

-- AddForeignKey
ALTER TABLE "MonthlyInterest" ADD CONSTRAINT "MonthlyInterest_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
