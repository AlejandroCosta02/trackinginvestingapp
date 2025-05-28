"use client";

import { Card, Title, Text, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody, Badge } from "@tremor/react";
import { useState } from "react";
import AddInvestmentDialog from "@/components/AddInvestmentDialog";
import { useInvestments } from "@/context/InvestmentContext";
import MonthlyInterestTable from "@/components/MonthlyInterestTable";
import { EyeIcon, TrashIcon } from "@heroicons/react/20/solid";

export default function InvestmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const { investments, addInvestment, deleteInvestment, loading, error } = useInvestments();

  const handleAddInvestment = async (investment: {
    name: string;
    initialCapital: number;
    interestRate: number;
    startDate: string;
    rateType: 'MONTHLY' | 'ANNUAL';
  }) => {
    const success = await addInvestment(investment);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
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

  const handleInterestConfirm = async (investmentId: string, month: string, amount: number) => {
    try {
      // Log the request data
      console.log('Confirming interest with data:', {
        investmentId,
        month,
        amount,
        investment: investments.find(inv => inv.id === investmentId)
      });

      const response = await fetch(`/api/investments/${investmentId}/confirm-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          data
        });
        throw new Error(data.error || "Failed to confirm interest");
      }

      // Log successful confirmation
      console.log('Interest confirmed successfully:', data);

      // Refresh the investments list
      window.location.reload();
    } catch (error) {
      console.error("Error confirming interest:", error);
      alert(error instanceof Error ? error.message : "Failed to confirm interest. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading investments...</div>
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
          <Title>Investments</Title>
          <Text>Manage your investment portfolio</Text>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Investment
        </button>
      </div>

      <Card className="bg-black text-white">
        {investments.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No investments found. Add your first investment to get started.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-gray-300">Name</TableHeaderCell>
                <TableHeaderCell className="text-gray-300">Initial Capital</TableHeaderCell>
                <TableHeaderCell className="text-gray-300">Current Value</TableHeaderCell>
                <TableHeaderCell className="text-gray-300">Interest Rate</TableHeaderCell>
                <TableHeaderCell className="text-gray-300">Start Date</TableHeaderCell>
                <TableHeaderCell className="text-gray-300">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((item) => (
                <TableRow key={item.id} className="border-gray-800">
                  <TableCell className="text-white">
                    <span>{item.name}</span>
                  </TableCell>
                  <TableCell className="text-white">${item.initialCapital.toLocaleString()}</TableCell>
                  <TableCell className="text-white">${item.currentCapital.toLocaleString()}</TableCell>
                  <TableCell className="text-white">{item.interestRate}%</TableCell>
                  <TableCell className="text-white">{new Date(item.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedInvestment(selectedInvestment === item.id ? null : item.id)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        title={selectedInvestment === item.id ? "Hide Details" : "Show Details"}
                      >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                          {selectedInvestment === item.id ? "Hide Details" : "Show Details"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteInvestment(item.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
          <Title className="mb-4">Monthly Interest Details</Title>
          {investments.map((investment) => (
            investment.id === selectedInvestment && (
              <MonthlyInterestTable
                key={investment.id}
                investment={investment}
                onInterestConfirm={(month, amount) => handleInterestConfirm(investment.id, month, amount)}
              />
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