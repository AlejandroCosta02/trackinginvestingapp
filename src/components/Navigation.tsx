"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Don't show protected navigation items while session is loading
  const isAuthenticated = status === 'authenticated' && session;

  return (
    <nav className="bg-brand-navy dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="InvestTrack Logo"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-contain bg-white"
                priority
                unoptimized
              />
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "border-brand-gold dark:border-yellow-500 text-white"
                      : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/investments"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/investments"
                      ? "border-brand-gold dark:border-yellow-500 text-white"
                      : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                  }`}
                >
                  Investments
                </Link>
              </div>
            )}
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300">{session.user?.name}</span>
                <ThemeToggle />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-brand-gold dark:bg-yellow-500 text-brand-navy dark:text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/auth/signin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-brand-gold dark:bg-yellow-500 text-brand-navy dark:text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/dashboard"
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/investments"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/investments"
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Investments
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 