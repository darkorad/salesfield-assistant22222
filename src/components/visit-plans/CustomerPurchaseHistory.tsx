
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Customer, Order } from "@/types";
import { useEffect, useState } from "react";
import { format, startOfYear } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerPurchaseHistoryProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SaleData = {
  id: string;
  date: string;
  total: number;
  payment_type: string;
  items: Array<{
    product: {
      Naziv: string;
      "Jedinica mere": string;
    };
    quantity: number;
  }>;
  darko_customer: Customer;
}

export const CustomerPurchaseHistory = ({ customer, open, onOpenChange }: CustomerPurchaseHistoryProps) => {
  const [orders, setOrders] = useState<SaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        // Get start of year date
        const yearStart = startOfYear(new Date());

        const { data: salesData, error } = await supabase
          .from('sales')
          .select('*, darko_customer:kupci_darko!fk_sales_kupci_darko(*)')
          .eq('user_id', session.user.id)
          .eq('darko_customer_id', customer.id)
          .gte('date', yearStart.toISOString())
          .order('date', { ascending: false });

        if (error) {
          console.error("Error loading sales:", error);
          toast.error("Greška pri učitavanju istorije kupovine");
          return;
        }

        setOrders(salesData || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadOrders();
    }
  }, [customer.id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Istorija kupovine - {customer.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-4">Učitavanje...</div>
          ) : (
            <div className="space-y-4 p-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500">Nema kupovina u ovoj godini</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {format(new Date(order.date), "dd.MM.yyyy. HH:mm")}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{order.total} RSD</div>
                        <div className="text-sm text-gray-500">
                          {order.payment_type === 'cash' ? 'Gotovina' : 'Račun'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{item.product.Naziv}</span>
                          <span>{item.quantity} {item.product["Jedinica mere"]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
