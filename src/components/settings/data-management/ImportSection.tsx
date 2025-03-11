
import { CardDescription } from "@/components/ui/card";
import { CustomerImport } from "./CustomerImport";
import { ProductImport } from "./ProductImport";

export const ImportSection = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Uvoz podataka</h3>
        <CardDescription>
          Uvezite kupce i cenovnik iz Excel fajla (.xlsx)
        </CardDescription>
      </div>
      
      <div className="space-y-4">
        <CustomerImport />
        <ProductImport />
      </div>
    </div>
  );
};
