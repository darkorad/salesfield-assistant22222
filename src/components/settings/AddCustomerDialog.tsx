import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { GPSCoordinatesInput } from "./GPSCoordinatesInput";
import { VATStatusSelect } from "./VATStatusSelect";
import { CustomerFormData, initialCustomerFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Morate biti prijavljeni da biste dodali novog kupca");
        return;
      }

      // Generate a simple numeric code for the customer
      const code = Date.now().toString().slice(-6);

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          user_id: user.id,
          code: code,
          name: customer.name,
          address: customer.address,
          city: customer.city,
          phone: customer.phone,
          pib: customer.pib,
          is_vat_registered: customer.isVatRegistered,
          gps_coordinates: customer.gpsCoordinates,
          naselje: customer.naselje
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Kupac je uspešno dodat");
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novi kupac
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj novog kupca</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime kupca</Label>
            <Input
              id="name"
              value={customer.name}
              onChange={handleInputChange("name")}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pib">PIB</Label>
            <Input
              id="pib"
              value={customer.pib}
              onChange={handleInputChange("pib")}
              required
              className="w-full"
            />
          </div>
          <VATStatusSelect 
            value={customer.isVatRegistered}
            onChange={(value) => setCustomer(prev => ({ ...prev, isVatRegistered: value }))}
          />
          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Input
              id="address"
              value={customer.address}
              onChange={handleInputChange("address")}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Grad</Label>
            <Input
              id="city"
              value={customer.city}
              onChange={handleInputChange("city")}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="naselje">Naselje</Label>
            <Input
              id="naselje"
              value={customer.naselje}
              onChange={handleInputChange("naselje")}
              className="w-full"
              placeholder="Unesite naselje"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={customer.phone}
              onChange={handleInputChange("phone")}
              className="w-full"
            />
          </div>
          <GPSCoordinatesInput 
            value={customer.gpsCoordinates}
            onChange={(value) => setCustomer(prev => ({ ...prev, gpsCoordinates: value }))}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Dodavanje..." : "Dodaj kupca"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};