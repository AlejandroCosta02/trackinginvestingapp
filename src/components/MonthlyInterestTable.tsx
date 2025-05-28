import { format } from "date-fns";
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { Card, Badge } from "@tremor/react";
import { Investment } from "@/lib/utils";
import { addMonths, isBefore, startOfMonth, isAfter } from "date-fns";
import { useState } from "react";
import { calculateMonthlyInterest } from "@/lib/utils";
import { TrashIcon } from "@heroicons/react/24/outline";

interface MonthlyInterestTableProps {
  investment: Investment;
  onInterestConfirm: (month: string, amount: number) => Promise<void>;
}

export default function MonthlyInterestTable({
  investment,
  onInterestConfirm,
}: MonthlyInterestTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Get the months from investment start date to 12 months into the future
  const getMonthlyInterestDates = () => {
    const months = [];
    
    // Ensure we're working with UTC dates
    const investmentDate = new Date(investment.startDate);
    investmentDate.setUTCHours(0, 0, 0, 0);
    
    // Interest starts from the month AFTER the investment start month
    const firstInterestMonth = startOfMonth(addMonths(investmentDate, 1));
    
    // Show months up to 12 months into the future
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const maxFutureDate = startOfMonth(addMonths(now, 12));

    console.log('MonthlyInterestTable - Date calculations:', {
      investmentStartDate: investment.startDate,
      firstInterestMonth: firstInterestMonth.toISOString(),
      maxFutureDate: maxFutureDate.toISOString(),
      now: now.toISOString()
    });

    // Start from the first interest month
    let currentMonth = firstInterestMonth;

    // Add months until we reach 12 months into the future
    while (!isAfter(currentMonth, maxFutureDate)) {
      months.push(currentMonth);
      currentMonth = addMonths(currentMonth, 1);
    }

    // Sort months in ascending order
    return months.sort((a, b) => a.getTime() - b.getTime());
  };

  const months = getMonthlyInterestDates();

  const getMonthlyInterest = (month: Date) => {
    return investment.monthlyInterests?.find(
      (interest) =>
        format(new Date(interest.month), "yyyy-MM") === format(month, "yyyy-MM")
    );
  };

  const handleConfirm = async (month: Date) => {
    const monthKey = format(month, "yyyy-MM");
    if (loading) return;

    try {
      setLoading(monthKey);
      const amount = calculateMonthlyInterest(investment);
      
      // Format the date as yyyy-MM-dd and ensure it's in UTC
      const confirmDate = new Date(month);
      confirmDate.setUTCHours(0, 0, 0, 0);
      const formattedDate = format(confirmDate, "yyyy-MM-dd");
      
      console.log('MonthlyInterestTable - Confirming interest for:', {
        month: month.toISOString(),
        formattedDate,
        amount,
        investmentStartDate: investment.startDate
      });

      await onInterestConfirm(formattedDate, amount);
    } finally {
      setLoading(null);
    }
  };

  if (months.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          No monthly interest entries available yet.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          Interest starts accruing from the month after your investment ({format(addMonths(new Date(investment.startDate), 1), "MMMM yyyy")}).
          Each row shows the interest earned during that month, which can be confirmed at the end of the period.
        </p>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Interest Period</TableHeaderCell>
            <TableHeaderCell>Expected Interest</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Confirmed On</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {months.map((month) => {
            const monthlyInterest = getMonthlyInterest(month);
            const monthKey = format(month, "yyyy-MM");
            const isLoading = loading === monthKey;
            const expectedInterest = calculateMonthlyInterest(investment);

            return (
              <TableRow key={monthKey}>
                <TableCell>
                  <div>
                    <span className="font-medium">{format(month, "MMMM yyyy")}</span>
                  </div>
                </TableCell>
                <TableCell>${Math.round(expectedInterest).toLocaleString('en-US')}</TableCell>
                <TableCell>
                  {monthlyInterest?.confirmed ? (
                    <Badge color="green">Confirmed</Badge>
                  ) : (
                    <Badge color="yellow">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {monthlyInterest?.confirmedAt
                    ? format(new Date(monthlyInterest.confirmedAt), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  {!monthlyInterest?.confirmed && (
                    <button
                      onClick={() => handleConfirm(month)}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {isLoading ? "Confirming..." : "Confirm Interest"}
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
} 