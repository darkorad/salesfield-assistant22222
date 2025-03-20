
import React, { useState, useRef, useEffect } from "react";
import { Customer } from "@/types";
import { CustomerSearchBar } from "./customer-list/CustomerSearchBar";
import { CustomerGrid } from "./customer-list/CustomerGrid";
import { CustomerOrderSection } from "./customer-order/CustomerOrderSection";
import { useCompletedCustomers } from "./hooks/useCompletedCustomers";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { useCustomersByDay } from "./hooks/useCustomersByDay";
import { toast } from "sonner";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const DaySchedule = ({ day, customers, onCustomerSelect }: DayScheduleProps) => {
  const { completedCustomers, isLoading: completedLoading, loadCompletedCustomers } = useCompletedCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const orderFormRef = useRef<HTMLDivElement>(null);
  
  // Filter customers for this specific day using the useCustomersByDay hook
  const customersForDay = useCustomersByDay(customers, day);
  
  // Then apply text search on the day-filtered customers
  const filteredCustomers = useCustomerSearch(customersForDay, searchTerm);

  // Log the customer counts to help debug
  useEffect(() => {
    console.log(`DaySchedule for ${day}:`, {
      totalCustomers: customers.length,
      customersForDay: customersForDay.length,
      filteredCustomers: filteredCustomers.length
    });
  }, [day, customers.length, customersForDay.length, filteredCustomers.length]);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);

    setTimeout(() => {
      orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOrderComplete = () => {
    setSelectedCustomer(null);
    loadCompletedCustomers();
  };

  if (completedLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <div className="col-span-full text-center text-gray-500 py-2 text-xs">
          Učitavanje...
        </div>
      </div>
    );
  }

  // Create a map to store customer-specific JSX content
  const renderCustomerGrid = () => {
    return (
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="space-y-2">
            <CustomerListItem 
              customer={customer}
              isCompleted={completedCustomers.has(customer.id)}
              isSelected={customer.id === selectedCustomer?.id}
              onClick={handleCustomerClick}
            />
            
            {/* Render the order form directly under this customer if selected */}
            {selectedCustomer?.id === customer.id && (
              <div ref={orderFormRef}>
                <CustomerOrderSection
                  customer={selectedCustomer}
                  onClose={() => setSelectedCustomer(null)}
                  onOrderComplete={handleOrderComplete}
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

  return (
    <div className="space-y-4">
      <CustomerSearchBar 
        searchTerm={searchTerm}
        onChange={setSearchTerm}
      />

      {customersForDay.length > 0 && (
        <div className="p-2 bg-amber-50 rounded text-xs border border-amber-200 mb-2">
          Prikazuje se {customersForDay.length} kupaca za {day}
        </div>
      )}

      {renderCustomerGrid()}
    </div>
  );
};

// We need to import this component here since we're using it directly
import { CustomerListItem } from "./customer-list/CustomerListItem";
