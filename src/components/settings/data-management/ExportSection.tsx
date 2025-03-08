
import { CustomerExport } from "./CustomerExport";
import { ProductExport } from "./ProductExport";

export const ExportSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Izvoz podataka</h3>
      <CustomerExport />
      <ProductExport />
    </div>
  );
};
