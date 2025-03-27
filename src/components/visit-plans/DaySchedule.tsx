
import React, { useState, useRef, useEffect } from "react";
import { Customer } from "@/types";
import { CustomerSearchBar } from "./customer-list/CustomerSearchBar";
import { useCompletedCustomers } from "./hooks/useCompletedCustomers";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import { useCustomersByDay } from "./hooks/useCustomersByDay";
import { DayScheduleInfo } from "./day-schedule/DayScheduleInfo";
import { LoadingState } from "./day-schedule/LoadingState";
import { CustomersList } from "./day-schedule/CustomersList";
import { useCustomerData } from "./hooks/useCustomerData";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  isOffline?: boolean;
}

export const DaySchedule = ({ day, customers, onCustomerSelect, isOffline }: DayScheduleProps) => {
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
      filteredCustomers: filteredCustomers.length,
      isOffline: isOffline
    });
    
    if (customersForDay.length > 0) {
      console.log(`Sample customers for ${day}:`, 
        customersForDay.slice(0, 3).map(c => ({ 
          name: c.name, 
          dan_posete: c.dan_posete,
          dan_obilaska: c.dan_obilaska,
          visit_day: c.visit_day
        }))
      );
    }
  }, [day, customers.length, customersForDay.length, filteredCustomers.length, isOffline]);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(prevCustomer => 
      prevCustomer?.id === customer.id ? null : customer
    );
    onCustomerSelect(customer);

    // If selecting a new customer (not deselecting the current one)
    if (!selectedCustomer || selectedCustomer.id !== customer.id) {
      setTimeout(() => {
        orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleOrderComplete = () => {
    setSelectedCustomer(null);
    loadCompletedCustomers();
  };

  if (completedLoading) {
    return <LoadingState isOffline={isOffline} />;
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
        isOffline={isOffline}
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
        isOffline={isOffline}
      />
    </div>
  );
};
