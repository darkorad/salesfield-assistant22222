import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processExcelFile } from "@/utils/excel-utils";
import { toast } from "@/hooks/use-toast";

export const FileImport = () => {
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    // Check last import dates and auto-load if needed
    const lastCustomersImport = localStorage.getItem(`lastCustomersImport_${currentUser}`);
    const lastProductsImport = localStorage.getItem(`lastProductsImport_${currentUser}`);

    if (lastCustomersImport) {
      const lastImport = new Date(lastCustomersImport);
      const today = new Date();
      // Auto-load if last import was today
      if (lastImport.toDateString() === today.toDateString()) {
        const savedCustomers = localStorage.getItem(`customers_${currentUser}`);
        if (savedCustomers) {
          localStorage.setItem("customers", savedCustomers); // Copy to current session
          console.log("Customers auto-loaded from localStorage");
        }
      }
    }

    // Same for products
    if (lastProductsImport) {
      const lastImport = new Date(lastProductsImport);
      const today = new Date();
      if (lastImport.toDateString() === today.toDateString()) {
        const savedProducts = localStorage.getItem(`products_${currentUser}`);
        if (savedProducts) {
          localStorage.setItem("products", savedProducts); // Copy to current session
          console.log("Products auto-loaded from localStorage");
        }
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "customers" | "products") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      processExcelFile(e.target?.result, type);
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Greška",
        description: `Greška pri čitanju ${type === "customers" ? "liste kupaca" : "cenovnika"}`
      });
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Lista kupaca (Excel)
          </label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "customers")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Cenovnik (Excel)
          </label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "products")}
          />
        </div>
      </CardContent>
    </Card>
  );
};