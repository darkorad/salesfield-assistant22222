
import React, { RefObject } from "react";
import { Customer } from "@/types";
import { CustomerListItem } from "../customer-list/CustomerListItem";
import { CustomerOrderSection } from "../customer-order/CustomerOrderSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomersListProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  completedCustomers: Set<string>;
  orderFormRef: RefObject<HTMLDivElement>;
  onCustomerClick: (customer: Customer) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  onOrderComplete: () => void;
  isOffline?: boolean;
}

export const CustomersList = ({
  customers,
  selectedCustomer,
  completedCustomers,
  orderFormRef,
  onCustomerClick,
  showHistory,
  setShowHistory,
  onOrderComplete,
  isOffline
}: CustomersListProps) => {
  const isMobile = useIsMobile();

  if (customers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 my-8">
        <p className="text-sm">Nema kupaca koji zadovoljavaju kriterijume pretrage</p>
        {isOffline && (
          <p className="text-xs mt-2 text-blue-600">
            U offline režimu prikazuju se samo prethodno sinhronizovani kupci
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div key={customer.id} className="space-y-2">
          <CustomerListItem
            customer={customer}
            isCompleted={completedCustomers.has(customer.id)}
            isSelected={customer.id === selectedCustomer?.id}
            onClick={onCustomerClick}
          />
          
          {/* Render the order form directly under this customer if selected */}
          {selectedCustomer?.id === customer.id && (
            <div 
              ref={orderFormRef}
              className={isMobile ? "bg-white shadow-lg rounded-lg p-4 border" : ""}
            >
              <CustomerOrderSection
                customer={selectedCustomer}
                onClose={() => onCustomerClick(selectedCustomer)}
                onOrderComplete={onOrderComplete}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
