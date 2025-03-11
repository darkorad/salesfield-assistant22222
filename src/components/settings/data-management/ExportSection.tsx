
import { CardDescription } from "@/components/ui/card";
import { CustomerExport } from "./CustomerExport";
import { ProductExport } from "./ProductExport";

export const ExportSection = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Izvoz podataka</h3>
        <CardDescription>
          Izvezite kupce i cenovnik u Excel format (.xlsx)
        </CardDescription>
      </div>
      
      <div className="space-y-4">
        <CustomerExport />
        <ProductExport />
      </div>
    </div>
  );
};
