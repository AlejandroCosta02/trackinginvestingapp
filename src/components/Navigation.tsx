"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">
                Investment <span className="text-indigo-500">Tracker</span>
              </h1>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/" 
                    ? "border-indigo-500 text-white" 
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/investments"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/investments"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
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