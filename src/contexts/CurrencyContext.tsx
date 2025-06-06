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

// Safe localStorage wrapper
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    // Initialize with saved preference if available
    const savedCurrency = safeStorage.getItem('preferredCurrency');
    if (savedCurrency) {
      const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
      if (currencyConfig) {
        return currencyConfig;
      }
    }
    return DEFAULT_CURRENCY;
  });

  // Load saved currency preference
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        // If user is logged in, try to fetch their preference from the API
        if (session?.user) {
          const response = await fetch('/api/users/currency');
          if (response.ok) {
            const data = await response.json();
            const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === data.preferredCurrency);
            if (currencyConfig) {
              setCurrencyState(currencyConfig);
              safeStorage.setItem('preferredCurrency', currencyConfig.code);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error loading currency preference:', error);
      }
    };

    loadCurrency();
  }, [session]);

  // Update currency preference
  const handleSetCurrency = async (newCurrency: CurrencyConfig) => {
    setCurrencyState(newCurrency);
    safeStorage.setItem('preferredCurrency', newCurrency.code);

    // Only update in database if user is logged in
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