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
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#0a0a0a]`}>
        <InvestmentProvider>
          <div className="min-h-screen">
            <Navigation />
            <main className="max-w-7xl mx-auto p-4 md:p-10">
              {children}
            </main>
          </div>
        </InvestmentProvider>
      </body>
    </html>
  );
}
