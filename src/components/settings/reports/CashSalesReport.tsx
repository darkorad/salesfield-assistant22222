
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
import { exportWorkbook } from "@/utils/fileExport";

export const CashSalesReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleExportTodayCashSales = async () => {
    try {
      if (isExporting) {
        toast.info("Izvoz je već u toku, sačekajte");
        return;
      }

      setIsExporting(true);
      toast.info("Priprema izveštaja u toku...");

      if (!selectedDate) {
        toast.error("Izaberite datum");
        setIsExporting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        setIsExporting(false);
        return;
      }

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      toast.info(`Učitavanje prodaje za ${format(selectedDate, 'dd.MM.yyyy')}...`);

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
        toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
        setIsExporting(false);
        return;
      }

      if (!salesData || salesData.length === 0) {
        toast.error(`Nema prodaje za dan ${format(selectedDate, 'dd.MM.yyyy')}`);
        setIsExporting(false);
        return;
      }

      console.log("All sales for selected date:", salesData?.length, salesData?.map(s => ({
        id: s.id,
        customer: s.customer?.name || s.darko_customer?.name || 'Unknown',
        items: s.items.length,
        itemsPaymentTypes: s.items.map((i: any) => i.paymentType || 'unknown')
      })));

      const cashSales = salesData?.filter(sale => {
        return Array.isArray(sale.items) && sale.items.some((item: any) => item.paymentType === 'cash');
      }) || [];

      if (cashSales.length === 0) {
        toast.error(`Nema prodaje za gotovinu na dan ${format(selectedDate, 'dd.MM.yyyy')}`);
        setIsExporting(false);
        return;
      }

      console.log("Found cash sales:", cashSales.length, cashSales.map(s => ({
        customer: s.customer?.name || s.darko_customer?.name || 'Unknown',
        itemsCount: s.items.length,
        cashItemsCount: s.items.filter((i: any) => i.paymentType === 'cash').length
      })));

      toast.info("Generisanje izveštaja...");

      const formattedSales = cashSales.map(sale => {
        const cashItems = Array.isArray(sale.items) 
          ? sale.items.filter((item: any) => item.paymentType === 'cash')
          : [];
          
        const cashTotal = cashItems.reduce((sum: number, item: any) => {
          if (!item.product) return sum;
          const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
          return sum + ((item.product.Cena || 0) * item.quantity * unitSize);
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
              Naziv: item.product?.Naziv || 'Nepoznat proizvod',
              "Jedinica mere": item.product?.["Jedinica mere"] || '1',
              Cena: item.product?.Cena || 0
            },
            quantity: item.quantity || 0,
            total: (item.quantity || 0) * (item.product?.Cena || 0) * (parseFloat(item.product?.["Jedinica mere"]) || 1)
          })),
          total: cashTotal,
          previousDebt: 0
        };
      });

      const { wb } = generateCashSalesWorksheet(formattedSales);

      const dateStr = format(selectedDate, 'dd-MM-yyyy');
      
      toast.info("Izvoz izveštaja u toku...");
      
      try {
        await exportWorkbook(wb, `gotovinska-prodaja-${dateStr}`);
        toast.success(`Izveštaj gotovinske prodaje za ${format(selectedDate, 'dd.MM.yyyy')} je uspešno izvezen i nalazi se u Download folderu`);
      } catch (exportError) {
        console.error("Error during export:", exportError);
        toast.error(`Greška pri izvozu: ${exportError instanceof Error ? exportError.message : String(exportError)}`);
      }
    } catch (error) {
      console.error("Error exporting cash sales:", error);
      toast.error(`Greška pri izvozu izveštaja: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-1">
      <div className="text-sm font-medium text-start">Izaberi datum</div>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
            onSelect={(date) => {
              setSelectedDate(date);
              setIsCalendarOpen(false);
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        className="w-full py-4 text-sm md:text-base font-medium mt-2"
        onClick={handleExportTodayCashSales}
        disabled={isExporting}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5" />
        {isExporting ? "Izvoz u toku..." : "Export keš kupovina"}
      </Button>
    </div>
  );
};
