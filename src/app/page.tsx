"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

// Helper function to format currency with thousand separators and cents
const formatCurrency = (value: number | string): string => {
  // Convert to number if string and fix to 2 decimal places
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const [integerPart, decimalPart] = numValue.toFixed(2).split('.');
  
  // Format integer part with dots as thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Return formatted number with comma for decimal separator
  return `${formattedInteger},${decimalPart}`;
};

// Helper function to parse formatted number back to raw value
const parseFormattedNumber = (value: string): number => {
  // Remove dots and replace comma with dot for parsing
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [calculatorValues, setCalculatorValues] = useState({
    initialAmount: 10000,
    monthlyContribution: 1000,
    years: 5,
    interestRate: 12
  });

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  const calculateCompoundInterest = () => {
    const { initialAmount, monthlyContribution, years, interestRate } = calculatorValues;
    let total = initialAmount;
    const monthlyRate = interestRate / 100 / 12;
    const months = years * 12;

    for (let i = 0; i < months; i++) {
      total += monthlyContribution;
      total *= (1 + monthlyRate);
    }

    return formatCurrency(total);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="bg-brand-navy dark:bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Maximize Your Investment Growth</h1>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Smart investment tracking and analytics to help you make informed decisions and grow your wealth.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center bg-brand-gold dark:bg-yellow-500 text-brand-navy dark:text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
          >
            Get Started
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-foreground mb-16">
          Why Choose InvestTrack?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <ChartBarIcon className="w-12 h-12 text-brand-navy dark:text-blue-400" />,
              title: "Track Returns",
              description: "Monitor your investment performance with real-time analytics and detailed insights."
            },
            {
              icon: <ArrowTrendingUpIcon className="w-12 h-12 text-brand-navy dark:text-blue-400" />,
              title: "Simulate Growth",
              description: "Use our advanced projection tools to forecast your investment's potential growth."
            },
            {
              icon: <CalculatorIcon className="w-12 h-12 text-brand-navy dark:text-blue-400" />,
              title: "Optimize Strategies",
              description: "Get personalized recommendations to maximize your investment returns."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card text-card-foreground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-brand-navy dark:bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">
            Calculate Your Investment Growth
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  label: "Initial Investment",
                  value: calculatorValues.initialAmount,
                  onChange: (value: number) =>
                    setCalculatorValues(prev => ({ ...prev, initialAmount: value })),
                  icon: BanknotesIcon,
                  prefix: "$",
                  isCurrency: true
                },
                {
                  label: "Monthly Contribution",
                  value: calculatorValues.monthlyContribution,
                  onChange: (value: number) =>
                    setCalculatorValues(prev => ({ ...prev, monthlyContribution: value })),
                  icon: CurrencyDollarIcon,
                  prefix: "$",
                  isCurrency: true
                },
                {
                  label: "Investment Period (Years)",
                  value: calculatorValues.years,
                  onChange: (value: number) =>
                    setCalculatorValues(prev => ({ ...prev, years: value })),
                  icon: CalendarIcon,
                  min: 1,
                  max: 50
                },
                {
                  label: "Expected Annual Return (%)",
                  value: calculatorValues.interestRate,
                  onChange: (value: number) =>
                    setCalculatorValues(prev => ({ ...prev, interestRate: value })),
                  icon: ArrowTrendingUpIcon,
                  suffix: "%",
                  min: 0,
                  max: 100
                }
              ].map((input, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <input.icon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    {input.label}
                  </label>
                  <div className="relative">
                    {input.prefix && (
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-navy dark:text-white text-lg">
                        {input.prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      value={input.isCurrency ? formatCurrency(input.value) : input.value}
                      onChange={(e) => {
                        const rawValue = input.isCurrency 
                          ? parseFloat(e.target.value.replace(/[^0-9.-]+/g, ""))
                          : parseFloat(e.target.value) || 0;
                        
                        if (input.min !== undefined && rawValue < input.min) return;
                        if (input.max !== undefined && rawValue > input.max) return;
                        
                        input.onChange(rawValue);
                      }}
                      className={`w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-brand-navy dark:text-white ${
                        input.prefix ? 'pl-10' : ''
                      } ${input.suffix ? 'pr-10' : ''} border border-gray-300 dark:border-gray-600`}
                    />
                    {input.suffix && (
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-navy dark:text-white text-lg">
                        {input.suffix}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card text-card-foreground p-8 rounded-xl border border-border">
              <h3 className="text-xl font-semibold mb-4">Projected Total</h3>
              <p className="text-4xl font-bold text-brand-gold dark:text-yellow-500">
                ${calculateCompoundInterest()}
              </p>
              <p className="mt-4 text-muted-foreground">
                This projection is based on compound interest calculated monthly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-card text-card-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">
              Stay Updated with Investment Insights
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
              />
              <button className="bg-brand-navy dark:bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} InvestTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
