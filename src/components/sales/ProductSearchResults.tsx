import { Product } from "@/types";

interface ProductSearchResultsProps {
  products: Product[];
  onSelect: (product: Product) => void;
  getProductPrice: (product: Product, paymentType: 'cash' | 'invoice') => number;
}

export const ProductSearchResults = ({ 
  products, 
  onSelect,
  getProductPrice 
}: ProductSearchResultsProps) => {
  console.log("Rendering ProductSearchResults with", products?.length, "products");

  if (!products || products.length === 0) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-gray-500">
        Nema pronađenih proizvoda
      </div>
    );
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      {products.map((product) => (
        <div
          key={product.id}
          className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
          onClick={() => onSelect(product)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium">{product.Naziv}</div>
              <div className="text-sm text-gray-500">{product.Proizvođač}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {product["Jedinica mere"]} | {product.Cena} RSD
              </div>
              <div className="text-xs text-gray-500">
                Račun: {getProductPrice(product, 'invoice')} RSD
                <br />
                Gotovina: {getProductPrice(product, 'cash')} RSD
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};