import { Customer } from "@/types";
import { CustomerInfoCard } from "../CustomerInfoCard";

interface CustomerInfoSectionProps {
  customer: Customer;
  onSyncComplete: () => void;
}

export const CustomerInfoSection = ({ 
  customer
}: CustomerInfoSectionProps) => {
  return (
    <div className="flex-1">
      <CustomerInfoCard customer={customer} />
    </div>
  );
};