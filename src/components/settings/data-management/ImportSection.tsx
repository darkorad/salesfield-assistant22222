
import { CustomerImport } from "./CustomerImport";
import { ProductImport } from "./ProductImport";

export const ImportSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Uvoz podataka</h3>
      <CustomerImport />
      <ProductImport />
    </div>
  );
};
