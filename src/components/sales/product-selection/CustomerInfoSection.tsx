
import { Customer } from "@/types";
import { CustomerInfoCard } from "../CustomerInfoCard";

interface CustomerInfoSectionProps {
  customer: Customer;
  onCustomerUpdate?: () => void;
}

export const CustomerInfoSection = ({ customer, onCustomerUpdate }: CustomerInfoSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <CustomerInfoCard customer={customer} onCustomerUpdate={onCustomerUpdate} />
    </div>
  );
};
