
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Customer } from "@/types";
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
        <Button variant="outline" size="sm">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {customers.map((customer) => (
          <DropdownMenuItem
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
          >
            {customer.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
