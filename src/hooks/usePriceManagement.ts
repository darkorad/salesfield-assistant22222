
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PriceUpdateParams {
  productId: string;
  invoicePrice: number;
  cashPrice: number;
  groupId?: string;
  customerId?: string;
}

export const usePriceManagement = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePrice = async ({
    productId,
    invoicePrice,
    cashPrice,
    groupId,
    customerId
  }: PriceUpdateParams) => {
    if (!productId || (!groupId && !customerId)) {
      toast.error("Nedostaju potrebni podaci");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error("Niste prijavljeni");
        return false;
      }

      const { error } = await supabase
        .from('price_changes')
        .insert({
          product_id: productId,
          invoice_price: invoicePrice,
          cash_price: cashPrice,
          group_id: groupId || null,
          customer_id: customerId || null,
          user_id: session.session.user.id
        });

      if (error) throw error;

      toast.success("Cena je uspešno ažurirana");
      return true;
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error("Greška pri ažuriranju cene");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updatePrice,
    isSubmitting
  };
};
