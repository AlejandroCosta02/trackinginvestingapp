'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CurrencyConfig, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency';
import toast from 'react-hot-toast';

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [mounted, setMounted] = useState(false);

  // Initialize currency preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedCurrency = window.localStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
      if (currencyConfig) {
        setCurrencyState(currencyConfig);
      }
    }
    setMounted(true);
  }, []);

  // Fetch user's currency preference when authenticated
  useEffect(() => {
    if (!mounted || status === 'loading' || !session?.user) return;

    const loadCurrency = async () => {
      try {
        const response = await fetch('/api/users/currency');
        if (response.ok) {
          const data = await response.json();
          const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === data.preferredCurrency);
          if (currencyConfig) {
            setCurrencyState(currencyConfig);
            window.localStorage.setItem('preferredCurrency', currencyConfig.code);
          }
        }
      } catch (error) {
        console.error('Error loading currency preference:', error);
      }
    };

    loadCurrency();
  }, [session, status, mounted]);

  // Update currency preference
  const handleSetCurrency = async (newCurrency: CurrencyConfig) => {
    setCurrencyState(newCurrency);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredCurrency', newCurrency.code);
    }

    if (session?.user) {
      try {
        const response = await fetch('/api/users/currency', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currency: newCurrency.code }),
        });

        if (!response.ok) {
          throw new Error('Failed to update currency preference');
        }
      } catch (error) {
        console.error('Error updating currency:', error);
        toast.error('Failed to save currency preference');
      }
    }
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
} 