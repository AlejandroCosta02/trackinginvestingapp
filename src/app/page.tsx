"use client";

import { calculatePortfolioMetrics, formatCurrency } from "@/lib/utils";
import { useInvestments } from "@/context/InvestmentContext";
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { investments, loading } = useInvestments();
  const metrics = calculatePortfolioMetrics(investments);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
        <p className="text-gray-400 mt-2">
          Track your investment performance and growth over time.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <BanknotesIcon className="w-6 h-6 text-blue-500" />
            <div className="ml-4">
              <p className="text-gray-400">Total Capital Invested</p>
              <p className="text-xl font-semibold text-white mt-1">
                {formatCurrency(metrics.totalInvested)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            <div className="ml-4">
              <p className="text-gray-400">Total Earned</p>
              <p className="text-xl font-semibold text-white mt-1">
                {formatCurrency(metrics.totalEarned)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <div className="ml-4">
              <p className="text-gray-400">Average Return Rate</p>
              <p className="text-xl font-semibold text-white mt-1">
                {metrics.averageReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
