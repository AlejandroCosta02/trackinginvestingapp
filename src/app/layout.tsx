import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "react-hot-toast";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Investment Tracking",
  description: "Track your investments and earnings",
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
        <CurrencyProvider>
          <NextAuthProvider>
            <Navigation />
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#059669',
                  },
                },
                error: {
                  style: {
                    background: '#dc2626',
                  },
                },
              }}
            />
          </NextAuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
