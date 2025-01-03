import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderItem } from "@/types";

interface RecentOrdersProps {
  onItemSelect: (items: OrderItem[]) => void;
}

export const RecentOrders = ({ onItemSelect }: RecentOrdersProps) => {
  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('items')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Nedavne porudžbine
      </h3>
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {recentOrders?.map((order, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => onItemSelect(order.items)}
            >
              <div className="truncate">
                {order.items.map((item: OrderItem) => item.product.Naziv).join(", ")}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};