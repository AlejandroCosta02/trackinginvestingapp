"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InvestmentProvider } from "@/context/InvestmentContext";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      console.log('No session found, redirecting to signin');
      router.replace('/auth/signin');
      return;
    }

    setIsLoading(false);
  }, [status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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