
import React, { useRef } from "react";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { CustomerOrderForm } from "../CustomerOrderForm";
import { OrderHistory } from "../../sales/OrderHistory";

interface CustomerOrderSectionProps {
  customer: Customer;
  onClose: () => void;
  onOrderComplete: () => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export const CustomerOrderSection = ({ 
  customer, 
  onClose, 
  onOrderComplete,
  showHistory,
  setShowHistory
}: CustomerOrderSectionProps) => {
  const orderFormRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={orderFormRef} className="relative">
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowHistory(true)}
          >
            <History className="h-4 w-4" />
          </Button>
          <span className="text-[10px] text-gray-600 mt-1">Istorija</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CustomerOrderForm 
        customer={customer}
        onOrderComplete={onOrderComplete}
      />

      <OrderHistory 
        customer={customer}
        open={showHistory}
        onOpenChange={setShowHistory}
      />
    </div>
  );
};
