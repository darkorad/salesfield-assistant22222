
import React, { useState, useRef } from "react";
import { Customer } from "@/types";
import { CustomerSearchBar } from "./customer-list/CustomerSearchBar";
import { CustomerGrid } from "./customer-list/CustomerGrid";
import { CustomerOrderSection } from "./customer-order/CustomerOrderSection";
import { useCompletedCustomers } from "./hooks/useCompletedCustomers";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { useCustomersByDay } from "./hooks/useCustomersByDay";

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

  return (
    <div className="space-y-4">
      <CustomerSearchBar 
        searchTerm={searchTerm}
        onChange={setSearchTerm}
      />

      <CustomerGrid
        customers={filteredCustomers}
        completedCustomers={completedCustomers}
        selectedCustomerId={selectedCustomer?.id || null}
        searchTerm={searchTerm}
        onCustomerClick={handleCustomerClick}
      />

      {selectedCustomer && (
        <CustomerOrderSection
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onOrderComplete={handleOrderComplete}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
      )}
    </div>
  );
};
