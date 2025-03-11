import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "sonner";
import { DuplicateGroup } from "./types";

export const useDuplicateChecker = () => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [autoDeleting, setAutoDeleting] = useState(false);

  const checkForDuplicates = async () => {
    setIsChecking(true);
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Fetch all customers
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .eq('user_id', session.user.id);

      if (error) {
        throw error;
      }

      // Find duplicates based on name and address
      const duplicateGroups: Record<string, Customer[]> = {};
      
      customers?.forEach(customer => {
        const key = `${customer.name.toLowerCase()}_${customer.address.toLowerCase()}`;
        if (!duplicateGroups[key]) {
          duplicateGroups[key] = [];
        }
        duplicateGroups[key].push(customer);
      });

      // Filter out groups with only one customer
      const result: DuplicateGroup[] = [];
      for (const key in duplicateGroups) {
        if (duplicateGroups[key].length > 1) {
          result.push({
            key,
            customers: duplicateGroups[key]
          });
        }
      }

      setDuplicates(result);
      
      if (result.length === 0) {
        toast.success("Nema duplikata kupaca");
      } else {
        toast.info(`Pronađeno ${result.length} grupa duplikata`);
        
        // Auto process groups with exactly 2 customers
        const toAutoProcess = result.filter(group => group.customers.length === 2);
        
        if (toAutoProcess.length > 0) {
          setAutoDeleting(true);
          await autoDeleteDuplicates(toAutoProcess);
          setAutoDeleting(false);
        }
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      toast.error(`Greška: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  };

  const autoDeleteDuplicates = async (groups: DuplicateGroup[]) => {
    try {
      let deletedCount = 0;
      
      for (const group of groups) {
        if (group.customers.length === 2) {
          // Always keep the customer with the oldest record (lowest ID usually)
          const [customerToKeep, customerToDelete] = group.customers.sort((a, b) => 
            a.id.localeCompare(b.id)
          );
          
          await supabase
            .from("customers")
            .delete()
            .eq('id', customerToDelete.id);
            
          deletedCount++;
        }
      }
      
      // Update the duplicates list after auto-deletion
      setDuplicates(prevDuplicates => 
        prevDuplicates.filter(group => group.customers.length !== 2)
      );
      
      if (deletedCount > 0) {
        toast.success(`Automatski obrisano ${deletedCount} duplikata`);
      }
    } catch (error) {
      console.error("Error during auto deletion:", error);
      toast.error(`Greška pri automatskom brisanju: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      // Update the duplicates list
      setDuplicates(prevDuplicates => 
        prevDuplicates.map(group => ({
          ...group,
          customers: group.customers.filter(c => c.id !== customerId)
        })).filter(group => group.customers.length > 1)
      );

      toast.success("Kupac uspešno obrisan");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error(`Greška: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleMerge = async (primaryCustomer: Customer, selectedCustomers: Customer[]) => {
    try {
      // Delete all customers except the primary one
      const customersToDelete = selectedCustomers.filter(c => c.id !== primaryCustomer.id);
      
      for (const customer of customersToDelete) {
        await supabase.from("customers").delete().eq('id', customer.id);
      }
      
      // Update the duplicates list
      setDuplicates(prevDuplicates => 
        prevDuplicates.filter(group => 
          !group.customers.every(c => 
            c.id === primaryCustomer.id || customersToDelete.some(dc => dc.id === c.id)
          )
        )
      );
      
      toast.success("Duplikati uspešno objedinjeni");
      return true;
    } catch (error) {
      console.error("Error merging customers:", error);
      toast.error(`Greška: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  return {
    duplicates,
    loading,
    isChecking,
    autoDeleting,
    checkForDuplicates,
    handleDeleteCustomer,
    handleMerge
  };
};
