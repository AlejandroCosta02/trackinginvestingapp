"use client";

import { Card, Text, Title } from "@tremor/react";
import { useInvestments } from "@/context/InvestmentContext";
import { WalletIcon, BanknotesIcon, ChartBarIcon, ScaleIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { investments, loading, error } = useInvestments();

  const metrics = {
    totalInvested: investments.reduce((sum, inv) => sum + inv.initialCapital, 0),
    currentAmount: investments.reduce((sum, inv) => sum + inv.currentCapital, 0),
    totalEarned: investments.reduce((sum, inv) => sum + inv.totalInterestEarned, 0),
    totalAmount: investments.reduce((sum, inv) => sum + inv.initialCapital + inv.totalInterestEarned, 0),
    averageReturn: investments.reduce((sum, inv) => sum + inv.interestRate, 0) / (investments.length || 1),
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
      <Title>Portfolio Overview</Title>
      <Text>Track your investment performance and growth over time.</Text>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-gray-900 text-white">
          <div className="flex items-center space-x-3">
            <BanknotesIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Capital Invested</p>
              <p className="text-2xl font-semibold">${metrics.totalInvested.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 text-white">
          <div className="flex items-center space-x-3">
            <ScaleIcon className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Total Earned</p>
              <p className="text-2xl font-semibold">${metrics.totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 text-white">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Average Return Rate</p>
              <p className="text-2xl font-semibold">{metrics.averageReturn.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="bg-gray-900 text-white">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-2xl font-semibold">${metrics.totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-xs text-gray-400 ml-auto">
              (Total Capital + Total Earned)
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 