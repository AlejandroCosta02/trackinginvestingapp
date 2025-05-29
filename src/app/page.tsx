"use client";

import { Card, Title, Text, Grid, Metric } from "@tremor/react";
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { calculatePortfolioMetrics, formatCurrency } from "@/lib/utils";
import { useInvestments } from "@/context/InvestmentContext";

export default function Home() {
  const { investments, loading } = useInvestments();
  const metrics = calculatePortfolioMetrics(investments);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-tremor-content">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Title className="text-tremor-content-strong">Portfolio Overview</Title>
        <Text className="text-tremor-content mt-2">
          Track your investment performance and growth over time.
        </Text>
      </div>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <Card 
          className="bg-tremor-background-emphasis ring-1 ring-tremor-ring"
          decoration="top"
          decorationColor="blue"
        >
          <div className="flex items-center">
            <BanknotesIcon className="w-6 h-6 text-blue-500" />
            <div className="ml-4">
              <Text className="text-tremor-content">Total Capital Invested</Text>
              <Metric className="text-tremor-content-strong">
                {formatCurrency(metrics.totalInvested)}
              </Metric>
            </div>
          </div>
        </Card>
        
        <Card 
          className="bg-tremor-background-emphasis ring-1 ring-tremor-ring"
          decoration="top"
          decorationColor="green"
        >
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            <div className="ml-4">
              <Text className="text-tremor-content">Total Earned</Text>
              <Metric className="text-tremor-content-strong">
                {formatCurrency(metrics.totalEarned)}
              </Metric>
            </div>
          </div>
        </Card>
        
        <Card 
          className="bg-tremor-background-emphasis ring-1 ring-tremor-ring"
          decoration="top"
          decorationColor="purple"
        >
          <div className="flex items-center">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <div className="ml-4">
              <Text className="text-tremor-content">Average Return Rate</Text>
              <Metric className="text-tremor-content-strong">
                {metrics.averageReturn.toFixed(1)}%
              </Metric>
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
