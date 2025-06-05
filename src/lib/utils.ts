import { addMonths, differenceInMonths, startOfMonth } from "date-fns";
import type { Investment as PrismaInvestment } from "@prisma/client";

export interface MonthlyInterest {
  id: number;
  amount: number;
  month: string;
  confirmed: boolean;
  confirmedAt?: string;
  reinvested: boolean;
  reinvestedAmount: number;
  expensesAmount: number;
  interestRate: number;
  investmentId: number;
  createdAt: string;
}

export interface Investment {
  id: number;
  name: string;
  initialCapital: number;
  currentCapital: number;
  interestRate: number;
  startDate: string;
  type: string;
  rateType: string;
  reinvestmentType: string;
  profitLockPeriod: number;
  monthlyInterests?: MonthlyInterest[];
  createdAt: string;
  updatedAt: string;
  totalInterestEarned: number;
  totalReinvested: number;
  totalExpenses: number;
  userId: string;
}

export const calculateMonthlyInterest = (investment: Investment): number => {
  if (!investment || !investment.currentCapital || !investment.interestRate) {
    return 0;
  }

  const monthlyRate = investment.rateType === 'ANNUAL' 
    ? (investment.interestRate / 12) / 100  // Convert annual rate to monthly percentage
    : investment.interestRate / 100;        // Use monthly rate as is
  
  // Calculate interest based on current capital
  return Math.round((investment.currentCapital * monthlyRate) * 100) / 100;
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
    totalAmount: investments.reduce((sum, inv) => sum + inv.currentCapital, 0),
    averageReturn:
      investments.reduce((sum, inv) => sum + inv.interestRate, 0) /
      (investments.length || 1),
  };
}; 