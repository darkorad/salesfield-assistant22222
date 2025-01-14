import React from "react";
import { Order } from "@/types";

interface TotalsSummaryProps {
  sales: Order[];
}

export const TotalsSummary = ({ sales }: TotalsSummaryProps) => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = sales.filter(sale => sale.payment_type === 'cash');
  const invoiceSales = sales.filter(sale => sale.payment_type === 'invoice');
  const totalCash = cashSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalInvoice = invoiceSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="pt-4 border-t space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Gotovina:</span>
        <span className="font-bold">{totalCash} RSD</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Račun:</span>
        <span className="font-bold">{totalInvoice} RSD</span>
      </div>
      <div className="flex justify-between items-center text-base pt-2 border-t">
        <span className="font-medium">Ukupno za danas:</span>
        <span className="font-bold">{totalSales} RSD</span>
      </div>
    </div>
  );
};