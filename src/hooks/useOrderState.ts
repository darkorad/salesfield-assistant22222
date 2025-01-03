import { useState } from "react";
import { Customer, OrderItem } from "@/types";

export const useOrderState = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

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