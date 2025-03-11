
import { useState } from "react";
import { Customer } from "@/types";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { DuplicateGroup } from "./types";

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  onDeleteCustomer: (customerId: string) => Promise<void>;
  onOpenMergeDialog: (customers: Customer[]) => void;
}

export const DuplicateGroupCard = ({ 
  group, 
  onDeleteCustomer, 
  onOpenMergeDialog 
}: DuplicateGroupCardProps) => {
  return (
    <Card className="border-amber-300">
      <CardHeader className="py-3 bg-amber-50">
        <CardTitle className="text-sm font-medium flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
          Duplikat: {group.customers[0].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-2">
          {group.customers.map(customer => (
            <div key={customer.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.address}, {customer.city}</div>
                <div className="text-xs text-gray-400">PIB: {customer.pib}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteCustomer(customer.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => onOpenMergeDialog(group.customers)}
        >
          Objedini duplikate
        </Button>
      </CardContent>
    </Card>
  );
};
