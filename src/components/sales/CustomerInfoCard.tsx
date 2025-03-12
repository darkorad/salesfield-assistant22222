
import { Customer } from "@/types";
import { EditCustomerDialog } from "@/components/settings/EditCustomerDialog";

interface CustomerInfoCardProps {
  customer: Customer;
  onCustomerUpdate?: () => void;
}

export const CustomerInfoCard = ({ customer, onCustomerUpdate }: CustomerInfoCardProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-700">Izabrani kupac:</h3>
        <EditCustomerDialog customer={customer} onCustomerUpdate={onCustomerUpdate} />
      </div>
      <div className="text-sm">
        <p><span className="font-medium">Ime:</span> {customer.name}</p>
        <p><span className="font-medium">Adresa:</span> {customer.address}</p>
        {customer.naselje && (
          <p><span className="font-medium">Naselje:</span> {customer.naselje}</p>
        )}
        {customer.phone && (
          <p><span className="font-medium">Telefon:</span> {customer.phone}</p>
        )}
        {customer.email && (
          <p><span className="font-medium">Email:</span> {customer.email}</p>
        )}
        {customer.dan_posete && (
          <p><span className="font-medium">Dan posete:</span> {customer.dan_posete}</p>
        )}
        {customer.visit_day && !customer.dan_posete && (
          <p><span className="font-medium">Dan posete:</span> {customer.visit_day}</p>
        )}
        {customer.dan_obilaska && (
          <p><span className="font-medium">Dan obilaska:</span> {customer.dan_obilaska}</p>
        )}
      </div>
    </div>
  );
};
