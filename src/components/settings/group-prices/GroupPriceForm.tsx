import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupSelection } from "./components/GroupSelection";
import { CustomerSelection } from "./components/CustomerSelection";
import { ProductSelection } from "./components/ProductSelection";
import { PriceInputs } from "./components/PriceInputs";
import { useGroupPriceForm } from "./hooks/useGroupPriceForm";

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
    setSelectedGroup,
    handleProductSelect,
    handleCustomerSelect,
    setCustomerSearch,
    setProductSearch,
    setInvoicePrice,
    setCashPrice,
    handleSubmit,
    isSubmitting
  } = useGroupPriceForm();

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
          onClick={handleSubmit}
          disabled={!selectedProduct || (!selectedGroup && !selectedCustomer) || !invoicePrice || !cashPrice || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Čuvanje..." : "Sačuvaj cene"}
        </Button>
      </CardContent>
    </Card>
  );
};