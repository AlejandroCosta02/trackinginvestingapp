"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-tremor-background-emphasis border-b border-tremor-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-tremor-content-strong">
                Investment <span className="text-tremor-brand">Tracker</span>
              </h1>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/" 
                    ? "border-tremor-brand text-tremor-content-strong" 
                    : "border-transparent text-tremor-content hover:border-tremor-content hover:text-tremor-content-strong"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/investments"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/investments"
                    ? "border-tremor-brand text-tremor-content-strong"
                    : "border-transparent text-tremor-content hover:border-tremor-content hover:text-tremor-content-strong"
                }`}
              >
                Investments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 