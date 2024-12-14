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

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const newCustomer = {
      id: crypto.randomUUID(),
      ...customer
    };
    
    customers.push(newCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));
    
    toast.success("Kupac je uspešno dodat");
    setOpen(false);
    setCustomer(initialCustomerFormData);
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
      <DialogContent>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pib">PIB</Label>
            <Input
              id="pib"
              value={customer.pib}
              onChange={handleInputChange("pib")}
              required
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Grad</Label>
            <Input
              id="city"
              value={customer.city}
              onChange={handleInputChange("city")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={customer.phone}
              onChange={handleInputChange("phone")}
            />
          </div>
          <GPSCoordinatesInput 
            value={customer.gpsCoordinates}
            onChange={(value) => setCustomer(prev => ({ ...prev, gpsCoordinates: value }))}
          />
          <Button type="submit" className="w-full">Dodaj kupca</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};