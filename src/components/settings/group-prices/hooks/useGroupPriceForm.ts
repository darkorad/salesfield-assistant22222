import { useState, useEffect } from "react";
import { Product, Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    const fetchProducts = async () => {
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
    const fetchCustomers = async () => {
      if (!selectedGroup) {
        setCustomers([]);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('group_name', selectedGroup.name)
        .order('name');

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Greška pri učitavanju kupaca");
        return;
      }

      setCustomers(data || []);
    };

    fetchCustomers();
  }, [selectedGroup]);

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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    try {
      if (selectedCustomer) {
        const { error } = await supabase
          .from('customer_prices')
          .upsert({
            customer_id: selectedCustomer.id,
            product_id: selectedProduct.id,
            invoice_price: parseFloat(invoicePrice),
            cash_price: parseFloat(cashPrice),
            user_id: session.user.id
          });

        if (error) throw error;
        toast.success("Cena za kupca uspešno sačuvana");
      } else if (selectedGroup) {
        const { error } = await supabase
          .from('group_prices')
          .upsert({
            group_id: selectedGroup.id,
            product_id: selectedProduct.id,
            invoice_price: parseFloat(invoicePrice),
            cash_price: parseFloat(cashPrice),
            user_id: session.user.id
          });

        if (error) throw error;
        toast.success("Cena za grupu uspešno sačuvana");
      }

      // Reset form
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setProductSearch("");
      setCustomerSearch("");
      setInvoicePrice("");
      setCashPrice("");
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error("Greška pri čuvanju cena");
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