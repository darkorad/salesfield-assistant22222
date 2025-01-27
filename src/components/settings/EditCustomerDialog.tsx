import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { CustomerFormData, initialCustomerFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormFields } from "./customer/CustomerFormFields";
import { Customer } from "@/types";

interface EditCustomerDialogProps {
  customer: Customer;
  onCustomerUpdate?: () => void;
}

export const EditCustomerDialog = ({ customer, onCustomerUpdate }: EditCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: customer.name,
    address: customer.address,
    city: customer.city,
    phone: customer.phone || "",
    email: customer.email || "",
    pib: customer.pib,
    isVatRegistered: customer.is_vat_registered || false,
    gpsCoordinates: customer.gps_coordinates || "",
    naselje: customer.naselje || "",
    visitDay: customer.visit_day || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          address: customerData.address,
          city: customerData.city,
          phone: customerData.phone,
          email: customerData.email,
          pib: customerData.pib,
          is_vat_registered: customerData.isVatRegistered,
          gps_coordinates: customerData.gpsCoordinates,
          naselje: customerData.naselje,
          visit_day: customerData.visitDay
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast.success("Podaci kupca su uspešno ažurirani");
      setOpen(false);
      if (onCustomerUpdate) {
        onCustomerUpdate();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Greška pri ažuriranju podataka kupca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomerData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Izmeni podatke
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izmeni podatke kupca</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <CustomerFormFields 
            customer={customerData}
            handleInputChange={handleInputChange}
            setCustomer={setCustomerData}
          />
          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ažuriranje..." : "Sačuvaj izmene"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};