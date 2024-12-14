import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const ExportButtons = () => {
  const handleExportBuyers = () => {
    const buyers = localStorage.getItem("customers");
    if (!buyers) {
      toast.error("Nema podataka o kupcima");
      return;
    }

    const buyersData = JSON.parse(buyers);
    const ws = XLSX.utils.json_to_sheet(buyersData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kupci");
    
    const colWidths = [
      { wch: 30 }, // name
      { wch: 40 }, // address
      { wch: 20 }, // city
      { wch: 15 }, // phone
      { wch: 15 }, // pib
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `lista-kupaca.xlsx`);
    toast.success("Lista kupaca je uspešno izvezena");
  };

  const handleExportPrices = () => {
    const products = localStorage.getItem("products");
    if (!products) {
      toast.error("Nema podataka o cenama");
      return;
    }

    const productsData = JSON.parse(products);
    const ws = XLSX.utils.json_to_sheet(productsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cenovnik");
    
    const colWidths = [
      { wch: 30 }, // name
      { wch: 20 }, // manufacturer
      { wch: 15 }, // price
      { wch: 10 }, // unit
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `cenovnik.xlsx`);
    toast.success("Cenovnik je uspešno izvezen");
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportBuyers}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi listu kupaca
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportPrices}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi cenovnik
        </Button>
      </div>
    </>
  );
};