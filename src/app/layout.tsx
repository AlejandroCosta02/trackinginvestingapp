import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { NextAuthProvider } from "@/components/Providers";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Investment Tracking",
  description: "Track your investments easily",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <CurrencyProvider>
              <Toaster position="top-right" />
              {children}
            </CurrencyProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
