
import { Card, CardContent } from "@/components/ui/card";
import { Customer } from "@/types";

interface CustomerInfoCardProps {
  customer: Customer;
  onCustomerUpdate?: () => void;
}

export const CustomerInfoCard = ({ customer, onCustomerUpdate }: CustomerInfoCardProps) => {
  return (
    <Card onClick={onCustomerUpdate} className={onCustomerUpdate ? "cursor-pointer" : ""}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="text-lg font-medium">{customer.name}</div>
          <div className="text-sm text-gray-500">
            <p>{customer.address}</p>
            <p>{customer.city}</p>
            {customer.phone && <p>{customer.phone}</p>}
            <p>PIB: {customer.pib}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
