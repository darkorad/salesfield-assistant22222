
import { useState } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  onMerge: (primaryCustomer: Customer) => Promise<void>;
}

export const MergeDialog = ({ 
  open, 
  onOpenChange, 
  customers, 
  onMerge 
}: MergeDialogProps) => {
  const [primaryCustomer, setPrimaryCustomer] = useState<Customer | null>(
    customers.length > 0 ? customers[0] : null
  );

  const handleMerge = async () => {
    if (!primaryCustomer) return;
    await onMerge(primaryCustomer);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Objedini duplikate</DialogTitle>
          <DialogDescription>
            Izaberite kupca kojeg želite da zadržite. Ostali će biti obrisani.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {customers.map(customer => (
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleMerge}>
            Objedini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
