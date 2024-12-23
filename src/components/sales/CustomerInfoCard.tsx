import { Customer } from "@/types";

interface CustomerInfoCardProps {
  customer: Customer;
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <h3 className="font-medium text-gray-700 mb-2">Izabrani kupac:</h3>
      <div className="text-sm">
        <p><span className="font-medium">Ime:</span> {customer.name}</p>
        <p><span className="font-medium">Adresa:</span> {customer.address}</p>
        {customer.phone && (
          <p><span className="font-medium">Telefon:</span> {customer.phone}</p>
        )}
      </div>
    </div>
  );
};