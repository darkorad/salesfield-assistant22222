
import { useState } from "react";
import { Customer } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDuplicateChecker } from "./duplicate-checker/useDuplicateChecker";
import { DuplicateGroupCard } from "./duplicate-checker/DuplicateGroupCard";
import { MergeDialog } from "./duplicate-checker/MergeDialog";

export const DuplicateCustomersChecker = () => {
  const { 
    duplicates, 
    loading, 
    isChecking, 
    autoDeleting,
    checkForDuplicates, 
    handleDeleteCustomer, 
    handleMerge 
  } = useDuplicateChecker();

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openMergeDialog = (customers: Customer[]) => {
    setSelectedCustomers(customers);
    setDialogOpen(true);
  };

  const handleMergeCustomers = async (primaryCustomer: Customer) => {
    const success = await handleMerge(primaryCustomer, selectedCustomers);
    if (success) {
      setDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provera duplikata kupaca</CardTitle>
        <CardDescription>
          Pronađite i uklonite kupce sa istim imenom i adresom
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={checkForDuplicates} 
          disabled={isChecking || autoDeleting}
          className="mb-4"
        >
          {isChecking ? "Provera u toku..." : autoDeleting ? "Automatsko brisanje..." : "Proveri duplikate"}
        </Button>

        {loading ? (
          <div className="text-center py-4">Učitavanje...</div>
        ) : duplicates.length > 0 ? (
          <div className="space-y-4">
            {duplicates.map((group, index) => (
              <DuplicateGroupCard 
                key={index} 
                group={group}
                onDeleteCustomer={handleDeleteCustomer}
                onOpenMergeDialog={openMergeDialog}
              />
            ))}
          </div>
        ) : (
          !isChecking && <div className="text-center py-4 text-gray-500">Kliknite na dugme da proverite duplikate</div>
        )}

        <MergeDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          customers={selectedCustomers}
          onMerge={handleMergeCustomers}
        />
      </CardContent>
    </Card>
  );
};
