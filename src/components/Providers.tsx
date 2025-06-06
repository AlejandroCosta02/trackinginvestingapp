"use client";

import { SessionProvider } from "next-auth/react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useState, useEffect } from "react";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextAuthProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </NextAuthProvider>
  );
} 