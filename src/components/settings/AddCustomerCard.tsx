
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerFormData, initialCustomerFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormFields } from "./customer/CustomerFormFields";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";

// Helper function to normalize day names for consistency
const normalizeDay = (day: string | undefined): string | undefined => {
  if (!day) return undefined;
  return day.toLowerCase().trim();
};

export const AddCustomerCard = () => {
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Morate biti prijavljeni da biste dodali novog kupca");
        return;
      }

      const code = Date.now().toString().slice(-6);

      // Normalize day fields before inserting
      const normalizedVisitDay = normalizeDay(customer.visitDay);
      const normalizedDanObilaska = normalizeDay(customer.danObilaska);

      // Check if it's Darko's account (zirmd.darko@gmail.com)
      if (user.email === 'zirmd.darko@gmail.com') {
        // Insert into kupci_darko table
        const { data, error } = await supabase
          .from('kupci_darko')
          .insert([{
            user_id: user.id,
            code: code,
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            dan_posete: normalizedVisitDay,
            dan_obilaska: normalizedDanObilaska
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Kupac je uspešno dodat");
      } else {
        // Insert into customers table
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: user.id,
            code: code,
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            visit_day: normalizedVisitDay,
            dan_obilaska: normalizedDanObilaska
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Kupac je uspešno dodat");
      }

      // Reset form after successful submission
      setCustomer(initialCustomerFormData);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error("Greška pri dodavanju kupca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomer(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger 
            asChild
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-accent" />
                <CardTitle>Dodaj novog kupca</CardTitle>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <CustomerFormFields 
                customer={customer}
                handleInputChange={handleInputChange}
                setCustomer={setCustomer}
              />
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Dodavanje..." : "Dodaj kupca"}
              </Button>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
