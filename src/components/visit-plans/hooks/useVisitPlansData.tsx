
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Customer } from "@/types";
import { useCustomerData } from "./useCustomerData";
import { useCustomerSubscription } from "./useCustomerSubscription";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  completed: boolean;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

export const useVisitPlansData = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const { 
    customers, 
    setCustomers, 
    isLoading, 
    error, 
    fetchCustomers,
    lastDataRefresh,
    isOffline
  } = useCustomerData();
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    const fetchedCustomers = await fetchCustomers();
    setCustomers(fetchedCustomers);
    // For visit plans, we're setting it to an empty array as we deleted all records
    setVisitPlans([]);
  }, [fetchCustomers, setCustomers]);

  useEffect(() => {
    fetchData();
  }, [fetchData, today]);

  // Use the subscription hook
  useCustomerSubscription(fetchData, isOffline);

  return {
    visitPlans,
    customers,
    isLoading,
    error,
    fetchData,
    today,
    lastDataRefresh,
    isOffline
  };
};
