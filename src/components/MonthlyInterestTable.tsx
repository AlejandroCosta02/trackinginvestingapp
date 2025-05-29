import { format } from "date-fns";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { Card, Badge } from "@tremor/react";
import { Investment } from "@/lib/utils";
import { addMonths, startOfMonth, isAfter } from "date-fns";
import { useState } from "react";
import { calculateMonthlyInterest } from "@/lib/utils";

interface MonthlyInterestTableProps {
  investment: Investment;
  onInterestConfirm: (month: string, amount: number, reinvestedAmount: number) => Promise<void>;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (totalAmount: number, reinvestedAmount: number) => void;
  expectedAmount: number;
}

function ConfirmDialog({ isOpen, onClose, onConfirm, expectedAmount }: ConfirmDialogProps) {
  const [totalAmount, setTotalAmount] = useState(expectedAmount);
  const [reinvestedAmount, setReinvestedAmount] = useState(expectedAmount);
  const expensesAmount = totalAmount - reinvestedAmount;

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
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setTotalAmount(value);
                if (value < reinvestedAmount) {
                  setReinvestedAmount(value);
                }
              }}
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount to Reinvest
            </label>
            <input
              type="number"
              value={reinvestedAmount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setReinvestedAmount(Math.min(value, totalAmount));
              }}
              max={totalAmount}
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount for Expenses
            </label>
            <div className="text-white font-medium bg-gray-700 rounded-md p-2">
              ${expensesAmount.toFixed(2)}
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
              onClick={() => onConfirm(totalAmount, reinvestedAmount)}
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

export default function MonthlyInterestTable({
  investment,
  onInterestConfirm,
}: MonthlyInterestTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmingMonth, setConfirmingMonth] = useState<Date | null>(null);

  const handleConfirm = async (month: Date) => {
    const expectedAmount = calculateMonthlyInterest(investment);
    setConfirmingMonth(month);
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
  };

  const months = getMonthlyInterestDates();

  const getMonthlyInterest = (month: Date) => {
    return investment.monthlyInterests?.find(
      (interest) =>
        format(new Date(interest.month), "yyyy-MM") === format(month, "yyyy-MM")
    );
  };

  return (
    <Card className="mt-4 bg-gray-900 text-white">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="text-gray-300">Month</TableHeaderCell>
            <TableHeaderCell className="text-gray-300">Expected Interest</TableHeaderCell>
            <TableHeaderCell className="text-gray-300">Received</TableHeaderCell>
            <TableHeaderCell className="text-gray-300">Reinvested</TableHeaderCell>
            <TableHeaderCell className="text-gray-300">Status</TableHeaderCell>
            <TableHeaderCell className="text-gray-300">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {months.map((month) => {
            const interest = getMonthlyInterest(month);
            const expectedAmount = calculateMonthlyInterest(investment);
            const isLoading = loading === format(month, "yyyy-MM");

            return (
              <TableRow key={month.toISOString()} className="border-gray-800">
                <TableCell className="text-white">
                  {format(month, "MMMM yyyy")}
                </TableCell>
                <TableCell className="text-white">
                  ${expectedAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-white">
                  {interest ? `$${interest.amount.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell className="text-white">
                  {interest ? (
                    interest.reinvested ? (
                      `$${(interest.amount * 0.3).toFixed(2)}`
                    ) : (
                      "Not reinvested"
                    )
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {interest ? (
                    <Badge color={interest.confirmed ? "green" : "yellow"}>
                      {interest.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  ) : (
                    <Badge color="gray">Upcoming</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!interest?.confirmed && (
                    <button
                      onClick={() => handleConfirm(month)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? "Confirming..." : "Confirm"}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {confirmingMonth && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmingMonth(null)}
          onConfirm={handleConfirmDialog}
          expectedAmount={calculateMonthlyInterest(investment)}
        />
      )}
    </Card>
  );
} 