"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { InvestmentProvider } from "@/context/InvestmentContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      console.log('No session found, redirecting to signin');
      router.replace('/auth/signin');
      return;
    }

    // If we have a session, ensure it's valid
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (!data || !data.user) {
          console.log('Invalid session, redirecting to signin');
          router.replace('/auth/signin');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        router.replace('/auth/signin');
      }
    };

    checkSession();
  }, [session, status, router]);

  if (status === 'loading') {
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