
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product } from "@/types";
import { toast } from "sonner";

export const useGroupPriceForm = () => {
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: productsData, error } = await supabase
        .from('products_darko')
        .select('*')
        .not('Naziv', 'eq', '');

      if (error) {
        console.error('Error fetching products:', error);
        toast.error("Greška pri učitavanju proizvoda");
        return;
      }

      setProducts(productsData || []);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.Naziv.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearch, products]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.Naziv);
    setInvoicePrice(product.Cena.toString());
    setCashPrice(product.Cena.toString());
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || (!selectedGroup && !selectedCustomer)) {
      toast.error("Molimo izaberite proizvod i grupu ili kupca");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        setIsSubmitting(false);
        return;
      }

      // Convert prices to numbers and validate
      const invoicePriceNum = parseFloat(invoicePrice);
      const cashPriceNum = parseFloat(cashPrice);
      
      if (isNaN(invoicePriceNum) || isNaN(cashPriceNum)) {
        toast.error("Nevažeća cena. Molimo unesite validne brojeve.");
        setIsSubmitting(false);
        return;
      }

      if (selectedGroup) {
        // For group prices, create a data object that ONLY includes
        // the fields we want to insert - explicitly excluding customer_id
        const groupPriceData = {
          group_id: selectedGroup.id,
          product_id: selectedProduct.id,
          invoice_price: invoicePriceNum,
          cash_price: cashPriceNum,
          user_id: session.user.id
        };
        
        console.log("Saving group prices:", groupPriceData);
        
        const { error: priceError } = await supabase
          .from('price_changes')
          .insert(groupPriceData);

        if (priceError) {
          console.error('Error saving group price:', priceError);
          toast.error(`Greška pri čuvanju cena: ${priceError.message}`);
          setIsSubmitting(false);
          return;
        }

        toast.success(`Cene za grupu ${selectedGroup.name} uspešno sačuvane`);
      } else if (selectedCustomer) {
        // For customer-specific prices
        const customerPriceData = {
          customer_id: selectedCustomer.id,
          product_id: selectedProduct.id,
          invoice_price: invoicePriceNum,
          cash_price: cashPriceNum,
          user_id: session.user.id
        };
        
        console.log("Saving customer prices:", customerPriceData);
        
        const { error: customerPriceError } = await supabase
          .from('price_changes')
          .insert(customerPriceData);

        if (customerPriceError) {
          console.error('Error saving customer price:', customerPriceError);
          toast.error(`Greška pri čuvanju cena: ${customerPriceError.message}`);
          setIsSubmitting(false);
          return;
        }

        toast.success(`Cena za kupca ${selectedCustomer.name} uspešno sačuvana`);
      }

      // Reset form after successful submission
      setSelectedProduct(null);
      setProductSearch("");
      setInvoicePrice("");
      setCashPrice("");
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error("Greška pri čuvanju cena");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedGroup,
    selectedProduct,
    selectedCustomer,
    customerSearch,
    customers,
    productSearch,
    invoicePrice,
    cashPrice,
    filteredProducts,
    isSubmitting,
    setSelectedGroup,
    handleProductSelect,
    handleCustomerSelect,
    setCustomerSearch,
    setProductSearch,
    setInvoicePrice,
    setCashPrice,
    handleSubmit
  };
};
