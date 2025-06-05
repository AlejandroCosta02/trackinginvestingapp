"use client";

import { InvestmentProvider } from "@/context/InvestmentContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InvestmentProvider>
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </InvestmentProvider>
  );
} 