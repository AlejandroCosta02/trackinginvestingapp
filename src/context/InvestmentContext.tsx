"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Investment } from "@/lib/utils";

interface InvestmentContextType {
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, "id" | "currentCapital" | "lastInterest" | "type">) => Promise<boolean>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<boolean>;
  deleteInvestment: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial investments
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setError(null);
        const response = await fetch("/api/investments");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch investments");
        }
        const data = await response.json();
        setInvestments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Error fetching investments:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  const addInvestment = async (
    investment: Omit<Investment, "id" | "currentCapital" | "lastInterest" | "type">
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add investment");
      }

      const newInvestment = await response.json();
      setInvestments((prev) => [...prev, newInvestment]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Error adding investment:", errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const updateInvestment = async (
    id: string,
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
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Error updating investment:", errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const deleteInvestment = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('Making delete request for investment:', id);
      const response = await fetch(`/api/investments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || "Failed to delete investment");
      }

      console.log('Delete request successful');
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Error deleting investment:", {
        error: err,
        message: errorMessage
      });
      setError(errorMessage);
      return false;
    }
  };

  return (
    <InvestmentContext.Provider
      value={{
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        loading,
        error,
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