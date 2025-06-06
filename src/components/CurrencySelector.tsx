'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CurrencySelector() {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-muted-foreground">Currency:</label>
      <Select
        value={currency.code}
        onValueChange={(value) => {
          const newCurrency = supportedCurrencies.find(c => c.code === value);
          if (newCurrency) {
            setCurrency(newCurrency);
          }
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {supportedCurrencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 