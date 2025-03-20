
import React, { useState, useRef, useEffect } from "react";
import { Customer } from "@/types";
import { CustomerSearchBar } from "./customer-list/CustomerSearchBar";
import { useCompletedCustomers } from "./hooks/useCompletedCustomers";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { useCustomersByDay } from "./hooks/useCustomersByDay";
import { DayScheduleInfo } from "./day-schedule/DayScheduleInfo";
import { LoadingState } from "./day-schedule/LoadingState";
import { CustomersList } from "./day-schedule/CustomersList";

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
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <CustomerSearchBar 
        searchTerm={searchTerm}
        onChange={setSearchTerm}
      />

      <DayScheduleInfo 
        day={day} 
        customersCount={customersForDay.length} 
      />

      <CustomersList 
        customers={filteredCustomers}
        selectedCustomer={selectedCustomer}
        completedCustomers={completedCustomers}
        orderFormRef={orderFormRef}
        onCustomerClick={handleCustomerClick}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
};
