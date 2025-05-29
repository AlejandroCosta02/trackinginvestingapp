import { addMonths, differenceInMonths, startOfMonth } from "date-fns";
import type { Investment as PrismaInvestment } from "@prisma/client";

export interface Investment {
  id: string;
  name: string;
  initialCapital: number;
  currentCapital: number;
  interestRate: number;
  startDate: string;
  type: string;
  lastInterest: number;
  createdAt?: string;
  updatedAt?: string;
  reinvestmentType?: 'COMPOUND' | 'WITHDRAWAL';
  rateType: 'MONTHLY' | 'ANNUAL';
  monthlyInterests?: Array<{
    id: string;
    amount: number;
    month: string;
    confirmed: boolean;
    confirmedAt?: string;
    reinvested: boolean;
    investmentId: string;
    createdAt: string;
  }>;
}

export const calculateMonthlyInterest = (investment: Investment | PrismaInvestment): number => {
  const monthlyRate = investment.rateType === 'ANNUAL' 
    ? investment.interestRate / 100 / 12  // Convert annual rate to monthly
    : investment.interestRate / 100;      // Use monthly rate as is
  return investment.currentCapital * monthlyRate;
};

export const calculateTotalEarnings = (investment: Investment): number => {
  return investment.currentCapital - investment.initialCapital;
};

export const getMonthsSinceStart = (startDate: string): number => {
  const start = startOfMonth(new Date(startDate));
  const now = startOfMonth(new Date());
  return differenceInMonths(now, start);
};

export const generateMonthlyDates = (startDate: string, months: number): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i <= months; i++) {
    dates.push(new Date(currentDate));
    currentDate = addMonths(currentDate, 1);
  }

  return dates;
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  months: number,
  rateType: 'MONTHLY' | 'ANNUAL' = 'ANNUAL'  // Default to annual for backward compatibility
): number => {
  const monthlyRate = rateType === 'ANNUAL'
    ? rate / 100 / 12  // Convert annual rate to monthly
    : rate / 100;      // Use monthly rate as is
  return principal * Math.pow(1 + monthlyRate, months);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculatePortfolioMetrics = (investments: Investment[]) => {
  return {
    totalInvested: investments.reduce((sum, inv) => sum + inv.initialCapital, 0),
    totalCurrent: investments.reduce((sum, inv) => sum + inv.currentCapital, 0),
    totalEarned: investments.reduce(
      (sum, inv) => sum + (inv.currentCapital - inv.initialCapital),
      0
    ),
    averageReturn:
      investments.reduce((sum, inv) => sum + inv.interestRate, 0) /
      (investments.length || 1),
  };
}; 