import { format } from "date-fns";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { Card, Badge } from "@tremor/react";
import { Investment, MonthlyInterest } from "@/lib/utils";
import { addMonths, startOfMonth, isAfter, differenceInMonths, isSameMonth } from "date-fns";
import { useState } from "react";
import { calculateMonthlyInterest } from "@/lib/utils";
import { PencilIcon } from "@heroicons/react/20/solid";

// Helper function to format currency with thousands separator and 2 decimal places
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to parse currency input
const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
};

interface MonthlyInterestTableProps {
  investment: Investment;
  onInterestConfirm: (month: string, amount: number, reinvestedAmount: number) => Promise<void>;
  onUpdateInterestRate: (newRate: number) => Promise<void>;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (totalAmount: number, reinvestedAmount: number) => void;
  expectedAmount: number;
}

// Helper function to check if a month is available for claiming profits
const isMonthAvailableForClaim = (investment: Investment, month: Date): boolean => {
  const startDate = startOfMonth(new Date(investment.startDate));
  const monthDate = startOfMonth(month);
  const monthsFromStart = differenceInMonths(monthDate, startDate);
  return monthsFromStart >= investment.profitLockPeriod;
};

function ConfirmDialog({ isOpen, onClose, onConfirm, expectedAmount }: ConfirmDialogProps) {
  const [expensesAmount, setExpensesAmount] = useState(0);
  
  // Calculate reinvestment amount automatically
  const reinvestedAmount = Math.max(0, expectedAmount - expensesAmount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">Confirm Interest</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Interest Received
            </label>
            <div className="text-white font-medium bg-gray-700 rounded-md p-3">
              {formatCurrency(expectedAmount)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount for Expenses
            </label>
            <input
              type="text"
              value={formatCurrency(expensesAmount)}
              onChange={(e) => {
                const value = parseCurrencyInput(e.target.value);
                // Ensure expenses don't exceed total
                setExpensesAmount(Math.min(value, expectedAmount));
              }}
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount to Reinvest
            </label>
            <div className="text-white font-medium bg-gray-700 rounded-md p-3">
              {formatCurrency(reinvestedAmount)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Automatically calculated: Total Interest - Expenses
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(expectedAmount, reinvestedAmount)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const calculateExpectedInterest = (investment: Investment, month: Date, monthlyInterest: MonthlyInterest | null | undefined, allMonthlyInterests: MonthlyInterest[]) => {
  // If the interest is already confirmed, return the confirmed amount
  if (monthlyInterest?.confirmed) {
    return monthlyInterest.amount;
  }

  // For future months, calculate based on current capital including all previous reinvestments
  let effectiveCapital = investment.initialCapital;

  // Sort monthly interests by date and only consider confirmed interests before the target month
  const previousMonths = allMonthlyInterests
    .filter(interest => 
      interest.confirmed && 
      new Date(interest.month) < month
    )
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Add all previous reinvestments to the effective capital
  for (const prevInterest of previousMonths) {
    effectiveCapital += prevInterest.reinvestedAmount;
  }

  // Use current interest rate for unconfirmed months
  const monthlyRate = investment.rateType === 'ANNUAL' 
    ? (investment.interestRate / 12) / 100  // Convert annual rate to monthly percentage
    : investment.interestRate / 100;        // Use monthly rate as is
  
  // Calculate interest based on effective capital and current rate
  const expectedInterest = Math.round((effectiveCapital * monthlyRate) * 100) / 100;

  return expectedInterest;
};

export default function MonthlyInterestTable({
  investment,
  onInterestConfirm,
  onUpdateInterestRate,
}: MonthlyInterestTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmingMonth, setConfirmingMonth] = useState<Date | null>(null);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newInterestRate, setNewInterestRate] = useState(investment.interestRate.toString());

  const handleRateUpdate = async () => {
    try {
      const rate = parseFloat(newInterestRate);
      if (isNaN(rate) || rate < 0 || (investment.rateType === 'ANNUAL' ? rate > 100 : rate > 20)) {
        throw new Error(`Interest rate must be between 0 and ${investment.rateType === 'ANNUAL' ? '100' : '20'}%`);
      }
      await onUpdateInterestRate(rate);
      setIsEditingRate(false);
    } catch (error) {
      console.error("Error updating interest rate:", error);
      alert(error instanceof Error ? error.message : "Failed to update interest rate");
    }
  };

  const handleConfirm = async (month: Date) => {
    try {
      const monthlyInterest = getMonthlyInterest(month);
      const expectedAmount = calculateExpectedInterest(
        investment, 
        month, 
        monthlyInterest, 
        investment.monthlyInterests || []
      );
      setConfirmingMonth(month);
    } catch (error) {
      console.error("Error calculating interest:", error);
    }
  };

  const handleConfirmDialog = async (totalAmount: number, reinvestedAmount: number) => {
    if (!confirmingMonth) return;
    
    try {
      setLoading(format(confirmingMonth, "yyyy-MM"));
      await onInterestConfirm(
        confirmingMonth.toISOString(),
        totalAmount,
        reinvestedAmount
      );
    } catch (error) {
      console.error("Error confirming interest:", error);
    } finally {
      setLoading(null);
      setConfirmingMonth(null);
    }
  };

  // Get the months from investment start date to 12 months into the future
  const getMonthlyInterestDates = () => {
    try {
      const months = [];
      const investmentDate = new Date(investment.startDate);
      investmentDate.setUTCHours(0, 0, 0, 0);
      const firstInterestMonth = startOfMonth(addMonths(investmentDate, 1));
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const maxFutureDate = startOfMonth(addMonths(now, 12));
      let currentMonth = firstInterestMonth;

      while (!isAfter(currentMonth, maxFutureDate)) {
        months.push(currentMonth);
        currentMonth = addMonths(currentMonth, 1);
      }

      return months.sort((a, b) => a.getTime() - b.getTime());
    } catch (error) {
      console.error("Error getting monthly interest dates:", error);
      return [];
    }
  };

  const months = getMonthlyInterestDates();

  const getMonthlyInterest = (month: Date) => {
    try {
      return investment.monthlyInterests?.find(
        (interest) =>
          format(new Date(interest.month), "yyyy-MM") === format(month, "yyyy-MM")
      );
    } catch (error) {
      console.error("Error getting monthly interest:", error);
      return null;
    }
  };

  if (!investment || !investment.initialCapital || !investment.currentCapital) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Interest Rate Edit Section */}
      <div className="mb-6 p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-muted-foreground">Current Interest Rate:</h3>
            {isEditingRate ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  className="w-24 px-2 py-1 rounded-lg bg-background text-foreground border border-border"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(e.target.value)}
                  min="0"
                  max={investment.rateType === 'ANNUAL' ? "100" : "20"}
                  step="0.1"
                />
                <span className="text-muted-foreground">%</span>
                <button
                  onClick={handleRateUpdate}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingRate(false);
                    setNewInterestRate(investment.interestRate.toString());
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-foreground">{investment.interestRate}%</span>
                <span className="text-sm text-muted-foreground">({investment.rateType === 'ANNUAL' ? 'Annual Rate' : 'Monthly Rate'})</span>
                <button
                  onClick={() => setIsEditingRate(true)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit Interest Rate"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        {isEditingRate && (
          <p className="mt-2 text-sm text-muted-foreground">
            Note: Changing the interest rate will only affect future unconfirmed months. Previously confirmed interests will remain unchanged.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Expected Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {months.map((month) => {
              const monthlyInterest = getMonthlyInterest(month);
              const expectedAmount = calculateExpectedInterest(
                investment, 
                month, 
                monthlyInterest, 
                investment.monthlyInterests || []
              );
              const isAvailable = isMonthAvailableForClaim(investment, month);

              return (
                <tr key={month.toISOString()}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {format(month, "MMMM yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatCurrency(expectedAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {monthlyInterest?.confirmed ? (
                      <Badge color="green">Confirmed</Badge>
                    ) : !isAvailable ? (
                      <Badge color="gray">Locked</Badge>
                    ) : (
                      <Badge color="yellow">Pending</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {monthlyInterest?.confirmed ? (
                      <div className="text-muted-foreground">
                        <div>Confirmed on {format(new Date(monthlyInterest.confirmedAt!), "MMM d, yyyy")}</div>
                        <div className="mt-1">
                          <div>Received: {formatCurrency(monthlyInterest.amount)}</div>
                          <div>Reinvested: {formatCurrency(monthlyInterest.reinvestedAmount)}</div>
                          <div>Expenses: {formatCurrency(monthlyInterest.expensesAmount)}</div>
                          <div className="mt-2 text-sm">
                            Rate when confirmed: {monthlyInterest.interestRate}% {investment.rateType === 'ANNUAL' ? '(Annual)' : '(Monthly)'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConfirm(month)}
                        disabled={!isAvailable || loading === format(month, "yyyy-MM")}
                        className={`px-4 py-2 rounded-lg ${
                          !isAvailable
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white transition-colors`}
                      >
                        {loading === format(month, "yyyy-MM") ? (
                          "Confirming..."
                        ) : !isAvailable ? (
                          "Locked"
                        ) : (
                          "Confirm Interest"
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmingMonth}
        onClose={() => setConfirmingMonth(null)}
        onConfirm={handleConfirmDialog}
        expectedAmount={confirmingMonth ? calculateExpectedInterest(
          investment, 
          confirmingMonth, 
          getMonthlyInterest(confirmingMonth),
          investment.monthlyInterests || []
        ) : 0}
      />
    </Card>
  );
} 