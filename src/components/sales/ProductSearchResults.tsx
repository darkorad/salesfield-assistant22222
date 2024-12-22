import { Product } from "@/types";

interface ProductSearchResultsProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductSearchResults = ({ products, onSelect }: ProductSearchResultsProps) => {
  if (products.length === 0) {
    return <div className="p-4 text-gray-500">Nema pronađenih proizvoda</div>;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      {products.map((product) => (
        <div
          key={product.id}
          className="p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
          onClick={() => onSelect(product)}
        >
          <span>{product.Naziv}</span>
          <span className="text-sm text-gray-500">
            {product.Cena} RSD/{product["Jedinica mere"]}
          </span>
        </div>
      ))}
    </div>
  );
};