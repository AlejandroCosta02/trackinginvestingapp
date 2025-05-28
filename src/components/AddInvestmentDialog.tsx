import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/solid";

interface AddInvestmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (investment: {
    name: string;
    initialCapital: number;
    interestRate: number;
    startDate: string;
    rateType: 'MONTHLY' | 'ANNUAL';
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      initialCapital: parseFloat(formData.initialCapital) || 0,
      interestRate: parseFloat(formData.interestRate) || 0,
    });
    setFormData({
      name: "",
      initialCapital: "",
      interestRate: "",
      startDate: new Date().toISOString().split("T")[0],
      rateType: 'ANNUAL',
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Add New Investment
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      placeholder="Enter investment name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Capital
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter initial capital"
                      value={formData.initialCapital}
                      onChange={(e) =>
                        setFormData({ ...formData, initialCapital: e.target.value })
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Interest Rate (%)
                      </label>
                      <div className="relative inline-block w-52">
                        <div className="flex h-10 rounded-xl bg-gray-100 p-1 gap-1">
                          <button
                            type="button"
                            className={`flex-1 relative flex items-center justify-center text-sm font-medium rounded-lg px-4 py-1.5 transition-all duration-300 ease-in-out transform ${
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
                            className={`flex-1 relative flex items-center justify-center text-sm font-medium rounded-lg px-4 py-1.5 transition-all duration-300 ease-in-out transform ${
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
                    <input
                      type="number"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.rateType === 'ANNUAL' 
                        ? 'Enter the annual interest rate (0-100%). For example: 12% per year'
                        : 'Enter the monthly interest rate (0-20%). For example: 1% per month'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <PlusIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="text-sm">Add Investment</span>
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