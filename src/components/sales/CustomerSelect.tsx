import { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerSelectProps {
  customers: Customer[];
  customerSearch: string;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSelect = ({
  customers,
  customerSearch,
  onCustomerSearchChange,
  onCustomerSelect,
}: CustomerSelectProps) => {
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    onCustomerSearchChange(customer.name);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Izbor kupca</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Pretraži kupca..."
            value={customerSearch}
            onChange={(e) => onCustomerSearchChange(e.target.value)}
            className="w-full"
          />
          {customerSearch && !customers.find(c => c.name === customerSearch) && filteredCustomers.length > 0 && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.address}, {customer.city}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px] bg-white max-h-[400px] overflow-y-auto">
            {customers.map((customer) => (
              <DropdownMenuItem
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className="flex flex-col items-start"
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.address}, {customer.city}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};