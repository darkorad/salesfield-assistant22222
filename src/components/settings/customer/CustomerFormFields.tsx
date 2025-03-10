
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "../types";
import { GPSCoordinatesInput } from "../GPSCoordinatesInput";
import { VATStatusSelect } from "../VATStatusSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFormFieldsProps {
  customer: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCustomer: (value: React.SetStateAction<CustomerFormData>) => void;
}

// Use lowercase Serbian day names to match the database normalized values
const visitDays = [
  { label: "Ponedeljak", value: "ponedeljak" },
  { label: "Utorak", value: "utorak" },
  { label: "Sreda", value: "sreda" },
  { label: "Četvrtak", value: "četvrtak" },
  { label: "Petak", value: "petak" },
  { label: "Subota", value: "subota" },
  { label: "Nedelja", value: "nedelja" }
];

export const CustomerFormFields = ({ customer, handleInputChange, setCustomer }: CustomerFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="md:col-span-2">
        <VATStatusSelect 
          value={customer.isVatRegistered}
          onChange={(value) => setCustomer(prev => ({ ...prev, isVatRegistered: value }))}
        />
      </div>
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
      <div className="space-y-2">
        <Label htmlFor="visit_day">Dan posete</Label>
        <Select 
          value={customer.visitDay?.toLowerCase() || ''} 
          onValueChange={(value) => setCustomer(prev => ({ ...prev, visitDay: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Izaberite dan" />
          </SelectTrigger>
          <SelectContent>
            {visitDays.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dan_obilaska">Dan obilaska</Label>
        <Select 
          value={customer.danObilaska?.toLowerCase() || ''} 
          onValueChange={(value) => setCustomer(prev => ({ ...prev, danObilaska: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Izaberite dan" />
          </SelectTrigger>
          <SelectContent>
            {visitDays.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <GPSCoordinatesInput 
          value={customer.gpsCoordinates}
          onChange={(value) => setCustomer(prev => ({ ...prev, gpsCoordinates: value }))}
        />
      </div>
    </div>
  );
};
