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
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        <InvestmentProvider>
          <div className="min-h-screen">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </InvestmentProvider>
      </body>
    </html>
  );
}
