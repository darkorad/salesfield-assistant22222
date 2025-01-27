import { Customer } from "@/types";
import { CustomerInfoCard } from "../CustomerInfoCard";
import { SyncPricesButton } from "../SyncPricesButton";

interface CustomerInfoSectionProps {
  customer: Customer;
  onSyncComplete: () => void;
}

export const CustomerInfoSection = ({ 
  customer, 
  onSyncComplete 
}: CustomerInfoSectionProps) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <CustomerInfoCard customer={customer} />
      </div>
      <SyncPricesButton 
        customerId={customer.id} 
        onSyncComplete={onSyncComplete}
      />
    </div>
  );
};