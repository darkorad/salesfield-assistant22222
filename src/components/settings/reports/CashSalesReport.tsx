
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheetGenerator";
import { format } from "date-fns";
import { CalendarIcon, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const CashSalesReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isExporting, setIsExporting] = useState(false);

  const handleExportTodayCashSales = async () => {
    try {
      setIsExporting(true);
      
      if (!selectedDate) {
        toast.error("Izaberite datum");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Get the start of the selected date in local timezone
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      // Get the end of the selected date (next day at 00:00)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Get all sales for the selected date - don't filter by payment_type
      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          darko_customer:kupci_darko!fk_sales_kupci_darko(*)
        `)
        .eq('user_id', session.user.id)
        .gte('date', startDate.toISOString())
        .lt('date', endDate.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      // Filter for cash sales by checking items
      const cashSales = salesData?.filter(sale => {
        // Check if any items have paymentType 'cash'
        return sale.items.some((item: any) => item.paymentType === 'cash');
      }) || [];

      if (cashSales.length === 0) {
        toast.error(`Nema prodaje za gotovinu na dan ${format(selectedDate, 'dd.MM.yyyy')}`);
        return;
      }

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

      // Generate filename with selected date
      const dateStr = format(selectedDate, 'dd-MM-yyyy');
      XLSX.writeFile(wb, `gotovinska-prodaja-${dateStr}.xlsx`);
      toast.success("Izveštaj je uspešno izvezen");

    } catch (error) {
      console.error("Error exporting cash sales:", error);
      toast.error("Greška pri izvozu izveštaja");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              "border-dashed border-input",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "dd.MM.yyyy")
            ) : (
              <span>Izaberite datum</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        className="flex-1 py-6 text-lg font-medium"
        onClick={handleExportTodayCashSales}
        disabled={isExporting}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExporting ? "Izvoz u toku..." : "Export keš kupovina"}
      </Button>
    </div>
  );
};
