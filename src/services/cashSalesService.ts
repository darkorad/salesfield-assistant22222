
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CashSale } from "@/types/reports";

/**
 * Fetch cash sales data for a specific date
 */
export const fetchCashSalesForDate = async (selectedDate: Date): Promise<CashSale[] | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return null;
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
      return null;
    }

    if (!salesData || salesData.length === 0) {
      toast.error(`Nema prodaje za dan ${format(selectedDate, 'dd.MM.yyyy')}`);
      return null;
    }

    return salesData;
  } catch (error) {
    console.error("Error fetching cash sales:", error);
    toast.error(`Greška pri učitavanju prodaje: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Filter cash sales from all sales data
 */
export const filterCashSales = (salesData: any[]): any[] => {
  const cashSales = salesData.filter(sale => {
    return Array.isArray(sale.items) && sale.items.some((item: any) => item.paymentType === 'cash');
  });

  if (cashSales.length === 0) {
    toast.error("Nema prodaje za gotovinu na izabrani dan");
    return [];
  }

  return cashSales;
};

/**
 * Format cash sales data for report
 */
export const formatCashSalesForReport = (cashSales: any[]): CashSale[] => {
  return cashSales.map(sale => {
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
};
