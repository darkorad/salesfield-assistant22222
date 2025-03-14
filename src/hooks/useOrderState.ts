
import { useState, useCallback } from "react";
import { Customer, OrderItem } from "@/types";

export const useOrderState = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    console.log("useOrderState handling customer select:", customer);
    if (!customer) return;
    
    // Update both states synchronously
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  }, []);

  const resetOrder = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setOrderItems([]);
  };

  return {
    selectedCustomer,
    customerSearch,
    orderItems,
    setCustomerSearch,
    setOrderItems,
    handleCustomerSelect,
    resetOrder
  };
};
