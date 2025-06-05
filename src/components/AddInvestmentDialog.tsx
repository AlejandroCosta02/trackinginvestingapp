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
  onAdd: (investment: {
    name: string;
    initialCapital: number;
    interestRate: number;
    startDate: string;
    rateType: 'MONTHLY' | 'ANNUAL';
    profitLockPeriod: number;
  }) => void;
}

export default function AddInvestmentDialog({
  isOpen,
  onClose,
  onAdd,
}: AddInvestmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    initialCapital: "",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    rateType: 'ANNUAL' as 'MONTHLY' | 'ANNUAL',
    profitLockPeriod: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      initialCapital: parseFormattedNumber(formData.initialCapital),
      interestRate: parseFloat(formData.interestRate) || 0,
      profitLockPeriod: formData.profitLockPeriod,
    });
    setFormData({
      name: "",
      initialCapital: "",
      interestRate: "",
      startDate: new Date().toISOString().split("T")[0],
      rateType: 'ANNUAL',
      profitLockPeriod: 1,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      initialCapital: "",
      interestRate: "",
      startDate: new Date().toISOString().split("T")[0],
      rateType: 'ANNUAL',
      profitLockPeriod: 1,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all relative">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 mb-6"
                >
                  Add New Investment
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <BuildingLibraryIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Investment Name
                    </label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-lg"
                      placeholder="Enter investment name"
                      value={formData.name}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 50); // Limit to 50 characters
                        setFormData({ ...formData, name: value });
                      }}
                      maxLength={50}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum 50 characters ({50 - formData.name.length} remaining)
                    </p>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Initial Capital
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
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
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-base font-medium text-gray-700 flex items-center gap-2">
                        <CalculatorIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                        Interest Rate (%)
                      </label>
                      <div className="relative inline-block w-52">
                        <div className="flex h-12 rounded-xl bg-gray-100 p-1 gap-1">
                          <button
                            type="button"
                            className={`flex-1 relative flex items-center justify-center text-base font-medium rounded-lg px-4 py-1.5 transition-all duration-300 ease-in-out transform ${
                              formData.rateType === 'MONTHLY'
                                ? 'bg-indigo-600 text-white scale-100'
                                : 'bg-transparent text-gray-500 scale-95 hover:bg-gray-200'
                            }`}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                rateType: 'MONTHLY',
                                interestRate: ''
                              })
                            }
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            className={`flex-1 relative flex items-center justify-center text-base font-medium rounded-lg px-4 py-1.5 transition-all duration-300 ease-in-out transform ${
                              formData.rateType === 'ANNUAL'
                                ? 'bg-indigo-600 text-white scale-100'
                                : 'bg-transparent text-gray-500 scale-95 hover:bg-gray-200'
                            }`}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                rateType: 'ANNUAL',
                                interestRate: ''
                              })
                            }
                          >
                            Annual
                          </button>
                        </div>
                      </div>
                    </div>
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
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-lg"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      Receive Profit After (months)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full h-12 px-4 pr-20 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter months"
                        value={formData.profitLockPeriod}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 60) {
                            setFormData({ ...formData, profitLockPeriod: value });
                          }
                        }}
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => {
                            if (formData.profitLockPeriod < 60) {
                              setFormData({ 
                                ...formData, 
                                profitLockPeriod: formData.profitLockPeriod + 1 
                              });
                            }
                          }}
                        >
                          <ChevronUpIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => {
                            if (formData.profitLockPeriod > 1) {
                              setFormData({ 
                                ...formData, 
                                profitLockPeriod: formData.profitLockPeriod - 1 
                              });
                            }
                          }}
                        >
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Specify how many months must pass before you can claim profits (1-60 months)
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-base"
                    >
                      <TrashIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200 text-base"
                    >
                      <PlusIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>Add Investment</span>
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