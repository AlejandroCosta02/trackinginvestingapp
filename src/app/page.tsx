"use client";

import { Card, Title, Text, Grid } from "@tremor/react";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Portfolio Overview</h1>
        <p className="mt-2 text-gray-400">
          Track your investment performance and growth over time.
        </p>
      </div>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card 
          className="bg-black/10 ring-1 ring-white/20 p-6"
          decoration="top"
          decorationColor="blue"
        >
          <div className="flex items-center">
            <BanknotesIcon className="w-6 h-6 text-blue-500" />
            <div className="ml-4">
              <Text className="text-gray-400">Total Capital Invested</Text>
              <p className="text-xl font-medium text-white mt-1">
                {formatCurrency(metrics.totalInvested)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="bg-black/10 ring-1 ring-white/20 p-6"
          decoration="top"
          decorationColor="green"
        >
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            <div className="ml-4">
              <Text className="text-gray-400">Total Earned</Text>
              <p className="text-xl font-medium text-white mt-1">
                {formatCurrency(metrics.totalEarned)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="bg-black/10 ring-1 ring-white/20 p-6"
          decoration="top"
          decorationColor="purple"
        >
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <div className="ml-4">
              <Text className="text-gray-400">Average Return Rate</Text>
              <p className="text-xl font-medium text-white mt-1">
                {metrics.averageReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
