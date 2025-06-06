"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Investment } from "@/lib/utils";

interface MonthlyInterest {
  id: number;
  amount: number;
  month: Date;
  confirmed: boolean;
  confirmedAt?: Date;
  reinvested: boolean;
  reinvestedAmount: number;
  expensesAmount: number;
  investmentId: number;
}

interface InvestmentContextType {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, "id" | "userId" | "currentCapital" | "totalInterestEarned" | "totalReinvested" | "totalExpenses" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updateInvestment: (id: number, investment: Partial<Investment>) => Promise<boolean>;
  deleteInvestment: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchInvestments();
  }, [session, status, router]);

  const fetchInvestments = async () => {
    try {
      setError(null);
      const response = await fetch("/api/investments");
      
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch investments");
      }
      
      const data = await response.json();
      setInvestments(data);
    } catch (err) {
      console.error("Error fetching investments:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (
    investment: Omit<Investment, "id" | "userId" | "currentCapital" | "totalInterestEarned" | "totalReinvested" | "totalExpenses" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investment),
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add investment");
      }

      const newInvestment = await response.json();
      setInvestments((prev) => [...prev, newInvestment]);
      return true;
    } catch (err) {
      console.error("Error adding investment:", err);
      setError(err instanceof Error ? err.message : "Failed to add investment");
      return false;
    }
  };

  const updateInvestment = async (
    id: number,
    investment: Partial<Investment>
  ): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/investments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investment),
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update investment");
      }

      const updatedInvestment = await response.json();
      setInvestments((prev) =>
        prev.map((inv) => (inv.id === id ? updatedInvestment : inv))
      );
      return true;
    } catch (err) {
      console.error("Error updating investment:", err);
      setError(err instanceof Error ? err.message : "Failed to update investment");
      return false;
    }
  };

  const deleteInvestment = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/investments/${id.toString()}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete investment");
      }

      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting investment:", err);
      setError(err instanceof Error ? err.message : "Failed to delete investment");
      return false;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <InvestmentContext.Provider
      value={{
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        loading,
        error,
        setInvestments,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestments() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestments must be used within an InvestmentProvider");
  }
  return context;
} 