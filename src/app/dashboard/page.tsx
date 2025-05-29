"use client";

import { Card, Text, Title } from "@tremor/react";
import { useInvestments } from "@/context/InvestmentContext";
import { WalletIcon, BanknotesIcon, ChartBarIcon, ScaleIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { investments, loading, error } = useInvestments();
  const [metrics, setMetrics] = useState({
    totalInvested: 0,
    totalEarned: 0,
    totalAmount: 0,
    averageReturn: 0,
  });

  useEffect(() => {
    try {
      if (investments.length > 0) {
        const calculatedMetrics = {
          totalInvested: investments.reduce((sum, inv) => sum + inv.initialCapital, 0),
          totalEarned: investments.reduce((sum, inv) => sum + inv.totalInterestEarned, 0),
          totalAmount: investments.reduce((sum, inv) => sum + inv.initialCapital + inv.totalInterestEarned, 0),
          averageReturn: investments.reduce((sum, inv) => sum + inv.interestRate, 0) / investments.length,
        };
        setMetrics(calculatedMetrics);
      }
    } catch (err) {
      console.error('Error calculating metrics:', err);
    }
  }, [investments]);

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

      {/* Total Amount Card */}
      <div className="mt-6">
        <Card className="bg-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CurrencyDollarIcon className="w-12 h-12 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-4xl font-bold">${metrics.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-full">
              Total Capital + Total Earned
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 