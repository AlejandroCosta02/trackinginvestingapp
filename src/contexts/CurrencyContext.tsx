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

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  supportedCurrencies: SUPPORTED_CURRENCIES,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currency, setCurrencyState] = useState<CurrencyConfig>(DEFAULT_CURRENCY);

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
              localStorage.setItem('preferredCurrency', currencyConfig.code);
              return;
            }
          }
        }

        // Fall back to localStorage if no user preference or API fails
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency) {
          const currencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
          if (currencyConfig) {
            setCurrencyState(currencyConfig);
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
    localStorage.setItem('preferredCurrency', newCurrency.code);

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