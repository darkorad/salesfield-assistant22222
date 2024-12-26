import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomerForm } from "./CustomerForm";
import { useCustomerSubmit } from "./useCustomerSubmit";
import { initialCustomerFormData } from "./types";

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  
  const { 
    customer, 
    handleSubmit, 
    handleInputChange,
    setCustomer 
  } = useCustomerSubmit(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novi kupac
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj novog kupca</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <CustomerForm 
            customer={customer}
            onInputChange={handleInputChange}
            onVATStatusChange={(value) => 
              setCustomer(prev => ({ ...prev, isVatRegistered: value }))
            }
            onGPSChange={(value) => 
              setCustomer(prev => ({ ...prev, gpsCoordinates: value }))
            }
          />
          <Button type="submit" className="w-full mt-4">
            Dodaj kupca
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};