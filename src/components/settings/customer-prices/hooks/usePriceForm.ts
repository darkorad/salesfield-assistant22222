import { useState } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePriceForm = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedProduct) {
      toast.error("Molimo izaberite kupca i proizvod");
      return;
    }

    const { error } = await supabase
      .from("customer_prices")
      .upsert({
        customer_id: selectedCustomer.id,
        product_id: selectedProduct.id,
        invoice_price: parseFloat(invoicePrice),
        cash_price: parseFloat(cashPrice),
        user_id: (await supabase.auth.getSession()).data.session?.user.id
      });

    if (error) {
      console.error("Error saving price:", error);
      toast.error("Greška pri čuvanju cene");
      return;
    }

    toast.success("Cena uspešno sačuvana");
    
    // Reset form
    setSelectedProduct(null);
    setProductSearch("");
    setInvoicePrice("");
    setCashPrice("");
  };

  return {
    selectedCustomer,
    setSelectedCustomer,
    selectedProduct,
    setSelectedProduct,
    customerSearch,
    setCustomerSearch,
    productSearch,
    setProductSearch,
    invoicePrice,
    setInvoicePrice,
    cashPrice,
    setCashPrice,
    handleSubmit
  };
};