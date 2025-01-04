import { Product } from "@/types";

interface PricesListProps {
  defaultPrices: any[];
  products: Product[];
}

export const PricesList = ({ defaultPrices, products }: PricesListProps) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Postojeće podrazumevane cene za gotovinu</h3>
      <div className="space-y-2">
        {defaultPrices.map((price) => {
          const product = products.find(p => p.id === price.product_id);
          if (!product) return null;
          
          return (
            <div key={price.id} className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{product.Naziv} - {product.Proizvođač}</div>
              <div className="text-sm text-gray-600">
                <div>Gotovina: {price.price} RSD</div>
                <div className="text-xs text-gray-500">Regularna cena: {product.Cena} RSD</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};