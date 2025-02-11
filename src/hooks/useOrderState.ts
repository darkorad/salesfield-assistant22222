
import { useState } from "react";
import { Customer, OrderItem } from "@/types";

export const useOrderState = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleCustomerSelect = (customer: Customer) => {
    console.log("useOrderState handling customer select:", customer);
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name); // Make sure to set the search term to match the selected customer
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
