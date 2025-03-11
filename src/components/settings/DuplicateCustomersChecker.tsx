import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DuplicateGroup {
  key: string;
  customers: Customer[];
}

export const DuplicateCustomersChecker = () => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [primaryCustomer, setPrimaryCustomer] = useState<Customer | null>(null);
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

  const openMergeDialog = (customers: Customer[]) => {
    setSelectedCustomers(customers);
    setPrimaryCustomer(customers[0]);
    setDialogOpen(true);
  };

  const handleMerge = async () => {
    if (!primaryCustomer) return;
    
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
      
      setDialogOpen(false);
      toast.success("Duplikati uspešno objedinjeni");
    } catch (error) {
      console.error("Error merging customers:", error);
      toast.error(`Greška: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provera duplikata kupaca</CardTitle>
        <CardDescription>
          Pronađite i uklonite kupce sa istim imenom i adresom
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={checkForDuplicates} 
          disabled={isChecking || autoDeleting}
          className="mb-4"
        >
          {isChecking ? "Provera u toku..." : autoDeleting ? "Automatsko brisanje..." : "Proveri duplikate"}
        </Button>

        {loading ? (
          <div className="text-center py-4">Učitavanje...</div>
        ) : duplicates.length > 0 ? (
          <div className="space-y-4">
            {duplicates.map((group, index) => (
              <Card key={index} className="border-amber-300">
                <CardHeader className="py-3 bg-amber-50">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                    Duplikat: {group.customers[0].name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="space-y-2">
                    {group.customers.map(customer => (
                      <div key={customer.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.address}, {customer.city}</div>
                          <div className="text-xs text-gray-400">PIB: {customer.pib}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => openMergeDialog(group.customers)}
                  >
                    Objedini duplikate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isChecking && <div className="text-center py-4 text-gray-500">Kliknite na dugme da proverite duplikate</div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Objedini duplikate</DialogTitle>
              <DialogDescription>
                Izaberite kupca kojeg želite da zadržite. Ostali će biti obrisani.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {selectedCustomers.map(customer => (
                <div key={customer.id} className="flex items-center space-x-2 py-2">
                  <input 
                    type="radio" 
                    id={customer.id} 
                    name="primaryCustomer" 
                    checked={primaryCustomer?.id === customer.id}
                    onChange={() => setPrimaryCustomer(customer)}
                    className="mr-2"
                  />
                  <label htmlFor={customer.id} className="flex-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.address}, {customer.city}</div>
                    <div className="text-xs text-gray-400">PIB: {customer.pib}</div>
                  </label>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={handleMerge}>
                Objedini
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
