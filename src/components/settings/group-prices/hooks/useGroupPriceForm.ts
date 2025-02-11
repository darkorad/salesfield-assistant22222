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
        return;
      }

      const timestamp = new Date().toISOString();

      if (selectedGroup) {
        // First update group prices
        const { error: groupError } = await supabase
          .from('group_prices')
          .upsert({
            group_id: selectedGroup.id,
            product_id: selectedProduct.id,
            invoice_price: parseFloat(invoicePrice),
            cash_price: parseFloat(cashPrice),
            user_id: session.user.id,
            last_changed: timestamp
          });

        if (groupError) throw groupError;

        // Then get all customers in the group
        const { data: groupCustomers, error: customersError } = await supabase
          .from('customers')
          .select('id')
          .eq('group_name', selectedGroup.name);

        if (customersError) {
          console.error('Error fetching group customers:', customersError);
          throw customersError;
        }

        // Update customer_prices for all customers in the group
        if (groupCustomers && groupCustomers.length > 0) {
          const customerUpdates = groupCustomers.map(customer => ({
            customer_id: customer.id,
            product_id: selectedProduct.id,
            invoice_price: parseFloat(invoicePrice),
            cash_price: parseFloat(cashPrice),
            user_id: session.user.id,
            last_changed: timestamp
          }));

          const { error: updateError } = await supabase
            .from('customer_prices')
            .upsert(customerUpdates);

          if (updateError) {
            console.error('Error updating customer prices:', updateError);
            throw updateError;
          }
        }

        toast.success("Cene za grupu uspešno sačuvane");
      } else if (selectedCustomer) {
        const { error } = await supabase
          .from('customer_prices')
          .upsert({
            customer_id: selectedCustomer.id,
            product_id: selectedProduct.id,
            invoice_price: parseFloat(invoicePrice),
            cash_price: parseFloat(cashPrice),
            user_id: session.user.id,
            last_changed: timestamp
          });

        if (error) throw error;
        toast.success("Cena za kupca uspešno sačuvana");
      }

      // Reset form after successful submission
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setProductSearch("");
      setCustomerSearch("");
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