import { CustomerFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GPSCoordinatesInput } from "./GPSCoordinatesInput";
import { VATStatusSelect } from "./VATStatusSelect";

interface CustomerFormProps {
  customer: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVATStatusChange: (value: boolean) => void;
  onGPSChange: (value: string) => void;
}

export const CustomerForm = ({ 
  customer, 
  onInputChange, 
  onVATStatusChange,
  onGPSChange 
}: CustomerFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ime kupca</Label>
        <Input
          id="name"
          value={customer.name}
          onChange={onInputChange("name")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pib">PIB</Label>
        <Input
          id="pib"
          value={customer.pib}
          onChange={onInputChange("pib")}
          required
        />
      </div>
      <VATStatusSelect 
        value={customer.isVatRegistered}
        onChange={onVATStatusChange}
      />
      <div className="space-y-2">
        <Label htmlFor="address">Adresa</Label>
        <Input
          id="address"
          value={customer.address}
          onChange={onInputChange("address")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Grad</Label>
        <Input
          id="city"
          value={customer.city}
          onChange={onInputChange("city")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          value={customer.phone}
          onChange={onInputChange("phone")}
        />
      </div>
      <GPSCoordinatesInput 
        value={customer.gpsCoordinates}
        onChange={onGPSChange}
      />
    </div>
  );
};