"use client";

import { Card, Title, Text } from "@tremor/react";
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { calculatePortfolioMetrics, formatCurrency } from "@/lib/utils";
import { useInvestments } from "@/context/InvestmentContext";

export default function Home() {
  const { investments, loading } = useInvestments();
  const metrics = calculatePortfolioMetrics(investments);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title className="text-white text-2xl font-bold">Portfolio Overview</Title>
        <Text className="text-gray-300 mt-2">Track your investment performance and growth over time.</Text>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-white/10 ring-1 ring-white/20">
          <div className="flex items-center">
            <BanknotesIcon className="w-6 h-6 text-blue-500" />
            <div className="ml-4">
              <Text className="text-gray-300">Total Capital Invested</Text>
              <Title className="text-white">{formatCurrency(metrics.totalInvested)}</Title>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/10 ring-1 ring-white/20">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            <div className="ml-4">
              <Text className="text-gray-300">Total Earned</Text>
              <Title className="text-white">{formatCurrency(metrics.totalEarned)}</Title>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/10 ring-1 ring-white/20">
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <div className="ml-4">
              <Text className="text-gray-300">Average Return Rate</Text>
              <Title className="text-white">{metrics.averageReturn.toFixed(1)}%</Title>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
