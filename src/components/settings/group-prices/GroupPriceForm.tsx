
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupSelection } from "./components/GroupSelection";
import { CustomerSelection } from "./components/CustomerSelection";
import { ProductSelection } from "./components/ProductSelection";
import { PriceInputs } from "./components/PriceInputs";
import { useGroupPriceForm } from "./hooks/useGroupPriceForm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const GroupPriceForm = () => {
  const {
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
  } = useGroupPriceForm();

  const onSubmit = async () => {
    try {
      await handleSubmit();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Greška pri čuvanju cena. Pokušajte ponovo.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podešavanje cena za grupe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GroupSelection
          selectedGroup={selectedGroup}
          onGroupSelect={setSelectedGroup}
        />

        <CustomerSelection
          selectedGroup={selectedGroup}
          customers={customers}
          customerSearch={customerSearch}
          selectedCustomer={selectedCustomer}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
        />

        <ProductSelection
          productSearch={productSearch}
          selectedProduct={selectedProduct}
          filteredProducts={filteredProducts}
          onProductSearchChange={setProductSearch}
          onProductSelect={handleProductSelect}
        />

        <PriceInputs
          selectedProduct={selectedProduct}
          invoicePrice={invoicePrice}
          cashPrice={cashPrice}
          onInvoicePriceChange={setInvoicePrice}
          onCashPriceChange={setCashPrice}
        />

        <Button 
          onClick={onSubmit}
          disabled={!selectedProduct || (!selectedGroup && !selectedCustomer) || !invoicePrice || !cashPrice || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Čuvanje...
            </>
          ) : (
            "Sačuvaj cene"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
