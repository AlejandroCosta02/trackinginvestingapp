"use client";

import { SessionProvider } from "next-auth/react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </NextAuthProvider>
  );
} 