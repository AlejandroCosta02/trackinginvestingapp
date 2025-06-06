"use client";

import { Card, Title, Text, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody } from "@tremor/react";
import { useState } from "react";
import AddInvestmentDialog from "@/components/AddInvestmentDialog";
import { useInvestments } from "@/context/InvestmentContext";
import MonthlyInterestTable from "@/components/MonthlyInterestTable";
import { EyeIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Investment, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function InvestmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(null);
  const { investments, addInvestment, deleteInvestment, loading, error, setInvestments } = useInvestments();

  const handleAddInvestment = async (investment: {
    name: string;
    initialCapital: number;
    interestRate: number;
    startDate: string;
    rateType: 'MONTHLY' | 'ANNUAL';
    profitLockPeriod: number;
  }) => {
    try {
      const success = await addInvestment({
        ...investment,
        startDate: new Date(investment.startDate),
        type: 'standard',
        reinvestmentType: 'COMPOUND',
      });

      if (success) {
        setIsDialogOpen(false);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      alert(error instanceof Error ? error.message : 'An unexpected error occurred');
      return false;
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this investment? This action cannot be undone.")) {
      console.log('Attempting to delete investment:', id);
      const success = await deleteInvestment(id);
      console.log('Delete operation result:', success);
      if (success) {
        setSelectedInvestment(null);
      } else {
        alert('Failed to delete investment. Please try again.');
      }
    }
  };

  const handleInterestConfirm = async (investmentId: number, month: string, amount: number, reinvestedAmount: number) => {
    try {
      const response = await fetch(`/api/investments/${investmentId}/confirm-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, amount, reinvestedAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm interest");
      }

      // Update the investments list in context with the full updated investment data
      setInvestments(prev => 
        prev.map(inv => 
          inv.id === investmentId 
            ? {
                ...inv,
                currentCapital: data.currentCapital,
                totalInterestEarned: data.totalInterestEarned,
                totalReinvested: data.totalReinvested,
                totalExpenses: data.totalExpenses,
                monthlyInterests: data.monthlyInterests
              }
            : inv
        )
      );

    } catch (error) {
      console.error("Error confirming interest:", error);
      alert(error instanceof Error ? error.message : "Failed to confirm interest. Please try again.");
    }
  };

  const handleInterestRateUpdate = async (investmentId: number, newRate: number) => {
    try {
      const response = await fetch(`/api/investments/${investmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interestRate: newRate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update interest rate");
      }

      // Update the investments list in context with the updated investment data
      setInvestments(prev => 
        prev.map(inv => 
          inv.id === investmentId 
            ? {
                ...inv,
                interestRate: newRate
              }
            : inv
        )
      );

    } catch (error) {
      console.error("Error updating interest rate:", error);
      alert(error instanceof Error ? error.message : "Failed to update interest rate. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-foreground">Loading investments...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Title className="text-foreground">Investments</Title>
          <Text className="text-muted-foreground">Manage your investment portfolio</Text>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Investment
        </button>
      </div>

      <Card className="bg-card rounded-xl border border-border overflow-hidden">
        {investments.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No investments found. Add your first investment to get started.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-muted-foreground">Name</TableHeaderCell>
                <TableHeaderCell className="text-muted-foreground">Initial Capital</TableHeaderCell>
                <TableHeaderCell className="text-muted-foreground">Current Value</TableHeaderCell>
                <TableHeaderCell className="text-muted-foreground">Interest Rate</TableHeaderCell>
                <TableHeaderCell className="text-muted-foreground">Start Date</TableHeaderCell>
                <TableHeaderCell className="text-muted-foreground">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="max-w-xs">
                        <div className="truncate text-foreground font-medium hover:text-clip" title={item.name}>
                          {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">
                      {formatCurrency(item.initialCapital)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">
                      {formatCurrency(item.currentCapital)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">
                      {item.interestRate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">
                      {format(new Date(item.startDate), "M/d/yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedInvestment(selectedInvestment === item.id ? null : item.id)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        {selectedInvestment === item.id ? "Hide Details" : "Show Details"}
                      </button>
                      <button
                        onClick={() => handleDeleteInvestment(item.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete Investment"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {selectedInvestment && (
        <div className="mt-6">
          {investments.map((investment) => (
            investment.id === selectedInvestment && (
              <>
                <div className="mb-6">
                  <Title>Monthly Interest Details</Title>
                  <div className="mt-2 text-lg text-gray-500 flex items-center gap-2">
                    <span>Investment:</span>
                    <span className="font-medium text-indigo-500">{investment.name}</span>
                  </div>
                </div>
                <MonthlyInterestTable
                  key={investment.id}
                  investment={investment}
                  onInterestConfirm={(month, amount, reinvestedAmount) => 
                    handleInterestConfirm(investment.id, month, amount, reinvestedAmount)
                  }
                  onUpdateInterestRate={(newRate) => handleInterestRateUpdate(investment.id, newRate)}
                />
              </>
            )
          ))}
        </div>
      )}

      <AddInvestmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddInvestment}
      />
    </main>
  );
} 