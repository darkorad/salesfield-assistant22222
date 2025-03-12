
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateCashSalesWorksheet } from "@/utils/reports/worksheet/cashSalesWorksheet";
import { exportWorkbook } from "@/utils/fileExport";

export const useCashSalesExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportCashSales = async (selectedDate: Date | undefined) => {
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
        toast.success(`Izveštaj gotovinske prodaje za ${format(selectedDate, 'dd.MM.yyyy')} je uspešno izvezen`);
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

  return {
    isExporting,
    exportCashSales
  };
};
