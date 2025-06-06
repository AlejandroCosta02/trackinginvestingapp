"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import CurrencySelector from "./CurrencySelector";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Don't show protected navigation items while session is loading
  const isAuthenticated = status === 'authenticated' && session;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              InvestTrack
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {isAuthenticated && (
              <>
                <a href="/dashboard">Dashboard</a>
                <a href="/investments">Investments</a>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center space-x-2">
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
              <CurrencySelector />
              {isAuthenticated ? (
                <>
                  <ThemeToggle />
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 h-9 px-4 py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <a
                    href="/auth/signin"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    Sign In
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
} 