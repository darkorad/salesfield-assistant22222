import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Order } from "@/types";

export const Reports = () => {
  const generateDailyReport = () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      const salesData = localStorage.getItem('sales');
      const sales = salesData ? JSON.parse(salesData) : [];
      
      const todaySales = sales.filter((sale: Order) => 
        sale.date.startsWith(dateStr)
      );

      const ws = XLSX.utils.json_to_sheet(todaySales.map((sale: Order) => ({
        'Datum': sale.date,
        'Kupac': sale.customer.name,
        'Ukupno (RSD)': sale.total,
        'Broj stavki': sale.items.length
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dnevni izveštaj");

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
      
      const monthlySales = sales.filter((sale: Order) => 
        sale.date.startsWith(`${year}-${month}`)
      );

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
  );
};
