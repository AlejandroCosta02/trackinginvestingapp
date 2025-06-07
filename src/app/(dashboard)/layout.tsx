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
    const checkAuth = async () => {
      console.log("Dashboard Layout - Session Status:", status);
      console.log("Dashboard Layout - Session Data:", session);

      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (status === 'unauthenticated' || !session?.user?.id) {
        console.log('No valid session found, redirecting to signin');
        router.replace('/auth/signin');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to sign in if no session
  if (status === 'unauthenticated' || !session?.user?.id) {
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