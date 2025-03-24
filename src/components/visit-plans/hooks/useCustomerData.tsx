
import { useState, useCallback } from "react";
import { Customer } from "@/types";
import { toast } from "sonner";
import { fetchAllCustomerData } from "./services/customerDataService";

export const useCustomerData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDataRefresh, setLastDataRefresh] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchAllCustomerData();
      
      setIsOffline(!!result.isOffline);
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return [];
      }
      
      if (result.lastDataRefresh) {
        setLastDataRefresh(result.lastDataRefresh);
      }
      
      return result.customers;
    } catch (error) {
      console.error("Error in fetchCustomers:", error);
      setError("Neočekivana greška pri učitavanju podataka. Molimo pokušajte ponovo.");
      toast.error("Neočekivana greška pri učitavanju podataka");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customers,
    setCustomers,
    isLoading,
    error,
    fetchCustomers,
    lastDataRefresh,
    isOffline
  };
};
