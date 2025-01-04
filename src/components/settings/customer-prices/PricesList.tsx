import { Product } from "@/types";

interface PricesListProps {
  customerPrices: any[];
  products: Product[];
}

export const PricesList = ({ customerPrices, products }: PricesListProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Postojeće posebne cene</h3>
      <div className="space-y-2">
        {customerPrices.reduce((acc: any[], price) => {
          const product = products.find(p => p.id === price.product_id);
          if (!product) return acc;
          
          const existingEntry = acc.find(e => e.product_id === price.product_id);
          if (existingEntry) {
            if (price.payment_type === 'cash') {
              existingEntry.cashPrice = price.price;
            } else {
              existingEntry.invoicePrice = price.price;
            }
          } else {
            acc.push({
              product_id: price.product_id,
              productName: `${product.Naziv} - ${product.Proizvođač}`,
              cashPrice: price.payment_type === 'cash' ? price.price : null,
              invoicePrice: price.payment_type === 'invoice' ? price.price : null,
            });
          }
          return acc;
        }, []).map((entry) => (
          <div key={entry.product_id} className="p-3 bg-gray-50 rounded-md">
            <div className="font-medium">{entry.productName}</div>
            <div className="text-sm text-gray-600">
              {entry.cashPrice && <div>Gotovina: {entry.cashPrice} RSD</div>}
              {entry.invoicePrice && <div>Račun: {entry.invoicePrice} RSD</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};