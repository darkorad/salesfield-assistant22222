import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "../types";
import { GPSCoordinatesInput } from "../GPSCoordinatesInput";
import { VATStatusSelect } from "../VATStatusSelect";

interface CustomerFormFieldsProps {
  customer: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCustomer: (value: React.SetStateAction<CustomerFormData>) => void;
}

export const CustomerFormFields = ({ customer, handleInputChange, setCustomer }: CustomerFormFieldsProps) => {
  return (
    <>
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
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={customer.email || ''}
          onChange={handleInputChange("email")}
          className="w-full"
        />
      </div>
      <GPSCoordinatesInput 
        value={customer.gpsCoordinates}
        onChange={(value) => setCustomer(prev => ({ ...prev, gpsCoordinates: value }))}
      />
    </>
  );
};