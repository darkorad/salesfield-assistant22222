import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Customer, Order } from "@/types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderHistoryProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderHistory = ({ customer, open, onOpenChange }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedOrders = localStorage.getItem("sales");
        if (savedOrders) {
          const allOrders = JSON.parse(savedOrders) as Order[];
          const customerOrders = allOrders.filter(
            (order) => order.customer.id === customer.id
          );
          // Sort orders by date, newest first
          customerOrders.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setOrders(customerOrders);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
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
          <DialogTitle>Istorija porudžbina - {customer.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500">Nema prethodnih porudžbina</p>
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
                        {order.paymentType === 'cash' ? 'Gotovina' : 'Račun'}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};