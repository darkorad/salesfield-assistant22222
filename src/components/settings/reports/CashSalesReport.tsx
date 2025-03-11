
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FileSpreadsheet, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheet/cashSalesWorksheet";
import { exportWorkbook } from "@/utils/exportUtils";

export const CashSalesReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleExportTodayCashSales = async () => {
    try {
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

      // Get all sales for the selected date - don't filter by payment_type at database level
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

      // Log all sales and their payment types for debugging
      console.log("All sales for selected date:", salesData?.length, salesData?.map(s => ({
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
        toast.error(`Nema prodaje za gotovinu na dan ${format(selectedDate, 'dd.MM.yyyy')}`);
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

      const { wb } = generateCashSalesWorksheet(formattedSales);

      // Generate filename with selected date
      const dateStr = format(selectedDate, 'dd-MM-yyyy');
      
      // Using the exportWorkbook utility
      await exportWorkbook(wb, `gotovinska-prodaja-${dateStr}`);

    } catch (error) {
      console.error("Error exporting cash sales:", error);
      toast.error("Greška pri izvozu izveštaja");
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-1">
      <div className="text-sm font-medium text-start">Izaberi datum</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline"
            className={cn(
              "w-full justify-start text-left text-sm md:text-base font-normal",
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
        className="w-full py-4 text-sm md:text-base font-medium mt-2"
        onClick={handleExportTodayCashSales}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5" />
        Export keš kupovina
      </Button>
    </div>
  );
};
