import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Customer, Product, Order } from "@/types";
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

  const generateDailyReport = () => {
    try {
      // Get today's date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      // Get sales data from localStorage
      const salesData = localStorage.getItem('sales');
      const sales = salesData ? JSON.parse(salesData) : [];
      
      // Filter for today's sales
      const todaySales = sales.filter((sale: Order) => 
        sale.date.startsWith(dateStr)
      );

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(todaySales.map((sale: Order) => ({
        'Datum': sale.date,
        'Kupac': sale.customer.name,
        'Ukupno (RSD)': sale.total,
        'Broj stavki': sale.items.length
      })));

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

      // Save file
      XLSX.writeFile(wb, `dnevni-izvestaj-${dateStr}.xlsx`);
      toast.success("Dnevni izveštaj je uspešno izvezen");
    } catch (error) {
      toast.error("Greška pri izvozu dnevnog izveštaja");
      console.error(error);
    }
  };

  const generateMonthlyReport = () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      
      const salesData = localStorage.getItem('sales');
      const sales = salesData ? JSON.parse(salesData) : [];
      
      // Filter for this month's sales
      const monthlySales = sales.filter((sale: Order) => 
        sale.date.startsWith(`${year}-${month}`)
      );

      const ws = XLSX.utils.json_to_sheet(monthlySales.map((sale: Order) => ({
        'Datum': sale.date,
        'Kupac': sale.customer.name,
        'Ukupno (RSD)': sale.total,
        'Broj stavki': sale.items.length
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mesečni izveštaj");

      XLSX.writeFile(wb, `mesecni-izvestaj-${year}-${month}.xlsx`);
      toast.success("Mesečni izveštaj je uspešno izvezen");
    } catch (error) {
      toast.error("Greška pri izvozu mesečnog izveštaja");
      console.error(error);
    }
  };

  const generateProductReport = () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      
      const salesData = localStorage.getItem('sales');
      const sales = salesData ? JSON.parse(salesData) : [];
      
      // Filter for this month's sales
      const monthlySales = sales.filter((sale: Order) => 
        sale.date.startsWith(`${year}-${month}`)
      );

      // Aggregate product data
      const productSummary = new Map();
      
      monthlySales.forEach((sale: Order) => {
        sale.items.forEach(item => {
          const key = item.product.id;
          if (!productSummary.has(key)) {
            productSummary.set(key, {
              'Proizvod': item.product.name,
              'Proizvođač': item.product.manufacturer,
              'Ukupna količina': 0,
              'Ukupna vrednost (RSD)': 0
            });
          }
          const summary = productSummary.get(key);
          summary['Ukupna količina'] += item.quantity;
          summary['Ukupna vrednost (RSD)'] += item.quantity * item.product.price;
        });
      });

      const ws = XLSX.utils.json_to_sheet(Array.from(productSummary.values()));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pregled proizvoda");

      XLSX.writeFile(wb, `pregled-proizvoda-${year}-${month}.xlsx`);
      toast.success("Mesečni pregled proizvoda je uspešno izvezen");
    } catch (error) {
      toast.error("Greška pri izvozu pregleda proizvoda");
      console.error(error);
    }
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
              onClick={generateDailyReport}
            >
              Izvezi dnevni izveštaj prodaje
            </Button>
            <Button
              className="w-full"
              onClick={generateMonthlyReport}
            >
              Izvezi mesečni izveštaj prodaje
            </Button>
            <Button
              className="w-full"
              onClick={generateProductReport}
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