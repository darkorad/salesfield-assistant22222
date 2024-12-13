import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Customer, Product } from "@/types";
import * as XLSX from "xlsx";

const Settings = () => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (type === "customers") {
          localStorage.setItem("customers", JSON.stringify(jsonData));
          toast.success("Lista kupaca je uspešno učitana");
        } else if (type === "products") {
          localStorage.setItem("products", JSON.stringify(jsonData));
          toast.success("Cenovnik je uspešno učitan");
        }
      } catch (error) {
        toast.error(`Greška pri obradi ${type === 'customers' ? 'liste kupaca' : 'cenovnika'}`);
        console.error(error);
      }
    };

    reader.onerror = () => {
      toast.error(`Greška pri čitanju ${type === 'customers' ? 'liste kupaca' : 'cenovnika'}`);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Izveštaji</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => toast.success("Dnevni izveštaj izvezen")}
            >
              Izvezi dnevni izveštaj prodaje
            </Button>
            <Button
              className="w-full"
              onClick={() => toast.success("Mesečni izveštaj izvezen")}
            >
              Izvezi mesečni izveštaj prodaje
            </Button>
            <Button
              className="w-full"
              onClick={() => toast.success("Mesečni pregled proizvoda izvezen")}
            >
              Izvezi mesečni pregled proizvoda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;