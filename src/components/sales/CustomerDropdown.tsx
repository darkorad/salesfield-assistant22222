import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerDropdownProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerDropdown = ({ customers, onCustomerSelect }: CustomerDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] bg-white max-h-[400px] overflow-y-auto z-50">
        {customers.map((customer) => (
          <DropdownMenuItem
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
            className="flex flex-col items-start"
          >
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">
              {customer.address}, {customer.naselje && `${customer.naselje},`} {customer.city}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};