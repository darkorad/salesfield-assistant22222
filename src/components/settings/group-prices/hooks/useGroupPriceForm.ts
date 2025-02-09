
import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { usePriceManagement } from "@/hooks/usePriceManagement";
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

  const { updatePrice, isSubmitting } = usePriceManagement();
  const { latestPrice } = usePriceHistory(
    selectedProduct?.id || null,
    selectedGroup?.id,
    selectedCustomer?.id
  );

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

  const handleProductSelect = async (product: Product) => {
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

    const success = await updatePrice({
      productId: selectedProduct.id,
      invoicePrice: parseFloat(invoicePrice),
      cashPrice: parseFloat(cashPrice),
      groupId: selectedGroup?.id,
      customerId: selectedCustomer?.id
    });

    if (success) {
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setProductSearch("");
      setCustomerSearch("");
      setInvoicePrice("");
      setCashPrice("");
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
