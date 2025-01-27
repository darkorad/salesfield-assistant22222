import { Customer } from "@/types";
import { CustomerInfoCard } from "../CustomerInfoCard";
import { SyncPricesButton } from "../SyncPricesButton";

interface CustomerInfoSectionProps {
  customer: Customer;
  onSyncComplete: () => void;
  onCustomerUpdate?: () => void;
}

export const CustomerInfoSection = ({ customer, onSyncComplete, onCustomerUpdate }: CustomerInfoSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <CustomerInfoCard customer={customer} onCustomerUpdate={onCustomerUpdate} />
      <SyncPricesButton 
        customerId={customer.id} 
        onSyncComplete={onSyncComplete}
      />
    </div>
  );
};