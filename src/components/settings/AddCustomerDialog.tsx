import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    pib: "",
    isVatRegistered: false,
    gpsCoordinates: ""
  });

  const handleGetGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = `${position.coords.latitude},${position.coords.longitude}`;
          setCustomer(prev => ({ ...prev, gpsCoordinates: coordinates }));
          toast.success("GPS koordinate su uspešno dodate");
        },
        (error) => {
          toast.error("Nije moguće dobiti GPS lokaciju");
          console.error("Error getting GPS location:", error);
        }
      );
    } else {
      toast.error("Vaš pretraživač ne podržava GPS lokaciju");
    }
  };

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
    setCustomer({ name: "", address: "", city: "", phone: "", pib: "", isVatRegistered: false, gpsCoordinates: "" });
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
              onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pib">PIB</Label>
            <Input
              id="pib"
              value={customer.pib}
              onChange={(e) => setCustomer(prev => ({ ...prev, pib: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatStatus">Kupac u PDV-u</Label>
            <Select
              value={customer.isVatRegistered ? "da" : "ne"}
              onValueChange={(value) => setCustomer(prev => ({ ...prev, isVatRegistered: value === "da" }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Izaberi PDV status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="da">Da</SelectItem>
                <SelectItem value="ne">Ne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Input
              id="address"
              value={customer.address}
              onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Grad</Label>
            <Input
              id="city"
              value={customer.city}
              onChange={(e) => setCustomer(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={customer.phone}
              onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gpsCoordinates">GPS Koordinate</Label>
            <div className="flex gap-2">
              <Input
                id="gpsCoordinates"
                value={customer.gpsCoordinates}
                onChange={(e) => setCustomer(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                placeholder="Latitude,Longitude"
                readOnly
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={handleGetGPSLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Dodaj GPS
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">Dodaj kupca</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};