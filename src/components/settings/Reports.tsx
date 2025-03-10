
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheetGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Reports = () => {
  const handleExportTodayCashSales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Get today's date at start of day in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date at start of day in local timezone
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all sales for today first - don't filter by payment_type at database level
      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          darko_customer:kupci_darko!fk_sales_kupci_darko(*)
        `)
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      // Log all sales and their payment types for debugging
      console.log("All sales today:", salesData?.length, salesData?.map(s => ({
        id: s.id,
        customer: s.customer?.name || s.darko_customer?.name || 'Unknown',
        items: s.items.length,
        itemsPaymentTypes: s.items.map((i: any) => i.paymentType || 'unknown')
      })));

      // Filter for cash sales by checking if ANY items have paymentType 'cash'
      const cashSales = salesData?.filter(sale => {
        return sale.items.some((item: any) => item.paymentType === 'cash');
      }) || [];

      if (cashSales.length === 0) {
        toast.error("Nema prodaje za gotovinu danas");
        return;
      }

      console.log("Found cash sales:", cashSales.length, cashSales.map(s => ({
        customer: s.customer?.name || s.darko_customer?.name || 'Unknown',
        itemsCount: s.items.length,
        cashItemsCount: s.items.filter((i: any) => i.paymentType === 'cash').length
      })));

      // Transform data for worksheet generator
      const formattedSales = cashSales.map(sale => {
        // Get only cash items from the sale
        const cashItems = sale.items.filter((item: any) => item.paymentType === 'cash');
        
        // Calculate the total only for cash items
        const cashTotal = cashItems.reduce((sum: number, item: any) => {
          const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
          return sum + (item.product.Cena * item.quantity * unitSize);
        }, 0);

        return {
          customer: sale.customer || sale.darko_customer || { 
            name: 'Nepoznat',
            address: 'N/A',
            city: 'N/A',
            phone: 'N/A'
          },
          items: cashItems.map((item: any) => ({
            product: {
              Naziv: item.product.Naziv,
              "Jedinica mere": item.product["Jedinica mere"],
              Cena: item.product.Cena
            },
            quantity: item.quantity,
            total: item.quantity * item.product.Cena * (parseFloat(item.product["Jedinica mere"]) || 1)
          })),
          total: cashTotal,
          previousDebt: 0 // You might want to fetch this from somewhere
        };
      });

      const { wb, ws } = generateCashSalesWorksheet(formattedSales);

      // Generate filename with current date
      const dateStr = new Date().toLocaleDateString('sr-RS').replace(/\./g, '-');
      XLSX.writeFile(wb, `gotovinska-prodaja-${dateStr}.xlsx`);
      toast.success("Izveštaj je uspešno izvezen");

    } catch (error) {
      console.error("Error exporting cash sales:", error);
      toast.error("Greška pri izvozu izveštaja");
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Izvoz izveštaja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportDailyDetailedReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Detaljan dnevni izveštaj
        </Button>
        
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportMonthlyCustomerReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Mesečna prodaja po kupcima
        </Button>
        
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportMonthlyItemsReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Mesečna prodaja po artiklima
        </Button>

        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportTodayCashSales}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Export keš kupovina
        </Button>
      </CardContent>
    </Card>
  );
};
