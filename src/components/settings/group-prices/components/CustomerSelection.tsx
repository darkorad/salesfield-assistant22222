
import { Customer } from "@/types";
import { CustomerSearchInput } from "@/components/sales/CustomerSearchInput";
import { CustomerSearchResults } from "@/components/sales/CustomerSearchResults";
import { useCustomerSearch } from "@/components/visit-plans/hooks/useCustomerSearch";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerSelectionProps {
  selectedGroup: { id: string; name: string } | null;
  customers: Customer[];
  customerSearch: string;
  selectedCustomer: Customer | null;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSelection = ({
  selectedGroup,
  customers,
  customerSearch,
  selectedCustomer,
  onCustomerSearchChange,
  onCustomerSelect,
}: CustomerSelectionProps) => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch all customers if none are provided
  useEffect(() => {
    const fetchCustomers = async () => {
      if (customers.length > 0) {
        setAllCustomers(customers);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          toast.error("Niste prijavljeni");
          return;
        }
        
        const { data, error } = await supabase
          .from("kupci_darko")
          .select("*")
          .order("name");
          
        if (error) {
          console.error("Error fetching customers:", error);
          toast.error("Greška pri učitavanju kupaca");
          return;
        }
        
        setAllCustomers(data as Customer[]);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Greška pri učitavanju kupaca");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [customers]);
  
  // Use the existing useCustomerSearch hook for better search functionality
  const filteredCustomers = useCustomerSearch(allCustomers, customerSearch);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Učitavanje kupaca...</div>;
  }

  return (
    <div>
      <label className="text-sm font-medium">Kupac (opcionalno)</label>
      <div className="relative">
        <CustomerSearchInput
          value={customerSearch}
          onChange={onCustomerSearchChange}
        />
        {customerSearch && !selectedCustomer && filteredCustomers.length > 0 && (
          <CustomerSearchResults
            customers={filteredCustomers}
            onCustomerSelect={onCustomerSelect}
          />
        )}
      </div>
    </div>
  );
};
