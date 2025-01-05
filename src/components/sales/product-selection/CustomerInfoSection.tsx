import { Customer } from "@/types";
import { CustomerInfoCard } from "../CustomerInfoCard";
import { SyncPricesButton } from "../SyncPricesButton";

interface CustomerInfoSectionProps {
  customer: Customer;
  onSyncComplete: () => void;
}

export const CustomerInfoSection = ({ customer, onSyncComplete }: CustomerInfoSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <CustomerInfoCard customer={customer} />
      <SyncPricesButton 
        customerId={customer.id} 
        onSyncComplete={onSyncComplete}
      />
    </div>
  );
};