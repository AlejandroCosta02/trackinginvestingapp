import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InvestmentProvider } from "@/context/InvestmentContext";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Investment Tracking",
  description: "Track your investments and their returns over time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} min-h-full bg-tremor-background-emphasis`}>
        <InvestmentProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </div>
        </InvestmentProvider>
      </body>
    </html>
  );
}
