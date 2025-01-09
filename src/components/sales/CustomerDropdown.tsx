import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";

interface CustomerDropdownProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerDropdown = ({ customers, onCustomerSelect }: CustomerDropdownProps) => {
  const sortedCustomers = useMemo(() => {
    if (!customers) return [];
    
    try {
      console.log("Sorting customers, total count:", customers.length);
      // Show all customers sorted alphabetically
      const sorted = [...customers].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '', 'sr-RS')
      );
      console.log("First few customers after sorting:", sorted.slice(0, 5).map(c => c.name));
      return sorted;
    } catch (error) {
      console.error("Error sorting customers:", error);
      return customers;
    }
  }, [customers]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] bg-white max-h-[400px] overflow-y-auto z-50">
        {sortedCustomers.map((customer) => (
          <DropdownMenuItem
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
            className="flex flex-col items-start"
          >
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">
              {customer.address}
              {customer.naselje && `, ${customer.naselje}`}
              {customer.city && `, ${customer.city}`}
            </div>
            {customer.email && (
              <div className="text-sm text-gray-500">{customer.email}</div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};