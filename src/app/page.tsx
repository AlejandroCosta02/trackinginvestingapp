"use client";

import { Card, Title, Text } from "@tremor/react";
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { calculatePortfolioMetrics, formatCurrency } from "@/lib/utils";
import { useInvestments } from "@/context/InvestmentContext";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  const { investments, loading } = useInvestments();
  const metrics = calculatePortfolioMetrics(investments);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="p-4 md:p-10 mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading investments...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title className="text-white">Portfolio Overview</Title>
        <Text className="text-gray-300">Track your investment performance and growth over time.</Text>
        
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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
      </main>
    </>
  );
}
