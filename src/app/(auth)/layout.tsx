"use client";

import { useSession } from "next-auth/react";
import { Navigation } from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Auth Layout - Session Status:", status);
      console.log("Auth Layout - Session Data:", session);

      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (status === 'unauthenticated') {
        setIsLoading(false);
        return;
      }

      if (status === 'authenticated' && session?.user?.id) {
        console.log('User is authenticated, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
} 