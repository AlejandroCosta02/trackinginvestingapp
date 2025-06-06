import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { 
  TrashIcon, 
  PlusIcon, 
  LockClosedIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CalculatorIcon,
  CalendarIcon
} from "@heroicons/react/24/solid";
import { useCurrency } from "@/contexts/CurrencyContext";

// Helper function to format currency with thousand separators
const formatCurrency = (value: string) => {
  // Remove any non-digit characters
  const number = value.replace(/[^0-9]/g, '');
  // Add thousand separators
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Helper function to parse formatted number back to raw value
const parseFormattedNumber = (value: string) => {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
};

interface AddInvestmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (investment: any) => void;
}

export default function AddInvestmentDialog({
  isOpen,
  onClose,
  onAdd,
}: AddInvestmentDialogProps) {
  const { currency } = useCurrency();
  const [formData, setFormData] = useState({
    name: "",
    initialCapital: "",
    interestRate: "",
    startDate: new Date().toISOString().split('T')[0],
    type: "FIXED_INCOME",
    rateType: "ANNUAL",
    reinvestmentType: "PARTIAL",
    profitLockPeriod: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      initialCapital: parseFormattedNumber(formData.initialCapital),
      currentCapital: parseFormattedNumber(formData.initialCapital),
      interestRate: parseFloat(formData.interestRate),
    });
    setFormData({
      name: "",
      initialCapital: "",
      interestRate: "",
      startDate: new Date().toISOString().split('T')[0],
      type: "FIXED_INCOME",
      rateType: "ANNUAL",
      reinvestmentType: "PARTIAL",
      profitLockPeriod: 1,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Add New Investment
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <BuildingLibraryIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Investment Name
                    </label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      placeholder="Enter investment name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Initial Capital
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                        {currency.symbol}
                      </span>
                      <input
                        type="text"
                        className="w-full h-12 px-10 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter amount"
                        value={formatCurrency(formData.initialCapital)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData({ ...formData, initialCapital: value });
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalculatorIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Interest Rate Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.rateType === "ANNUAL"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, rateType: "ANNUAL" })
                        }
                      >
                        Annual
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.rateType === "MONTHLY"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, rateType: "MONTHLY" })
                        }
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalculatorIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Interest Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder={`Enter ${formData.rateType.toLowerCase()} interest rate`}
                        value={formData.interestRate}
                        onChange={(e) =>
                          setFormData({ ...formData, interestRate: e.target.value })
                        }
                        min="0"
                        max={formData.rateType === 'ANNUAL' ? "100" : "20"}
                        step="0.1"
                        required
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">%</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.rateType === 'ANNUAL' 
                        ? 'Enter the annual interest rate (0-100%). For example: 12% per year'
                        : 'Enter the monthly interest rate (0-20%). For example: 1% per month'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Investment Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.type === "FIXED_INCOME"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, type: "FIXED_INCOME" })
                        }
                      >
                        Fixed Income
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.type === "VARIABLE_INCOME"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, type: "VARIABLE_INCOME" })
                        }
                      >
                        Variable Income
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Reinvestment Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.reinvestmentType === "TOTAL"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, reinvestmentType: "TOTAL" })
                        }
                      >
                        Total
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.reinvestmentType === "PARTIAL"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, reinvestmentType: "PARTIAL" })
                        }
                      >
                        Partial
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-12 px-4 rounded-lg border-2 ${
                          formData.reinvestmentType === "NONE"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, reinvestmentType: "NONE" })
                        }
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Profit Lock Period (months)
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="h-12 w-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profitLockPeriod: Math.max(1, prev.profitLockPeriod - 1),
                          }))
                        }
                      >
                        <ChevronDownIcon className="h-6 w-6" />
                      </button>
                      <span className="text-2xl font-medium text-gray-900 w-12 text-center">
                        {formData.profitLockPeriod}
                      </span>
                      <button
                        type="button"
                        className="h-12 w-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profitLockPeriod: prev.profitLockPeriod + 1,
                          }))
                        }
                      >
                        <ChevronUpIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="h-12 px-6 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-12 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Add Investment
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 