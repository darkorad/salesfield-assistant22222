
import React from "react";
import { Order } from "@/types";

interface TotalsSummaryProps {
  sales: Order[];
}

export const TotalsSummary = ({ sales }: TotalsSummaryProps) => {
  // Calculate corrected totals including quantity and unit measurements
  const calculateCorrectTotal = (sale: Order) => {
    return sale.items.reduce((sum, item) => {
      const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
      return sum + (item.product.Cena * item.quantity * unitSize);
    }, 0);
  };

  const totalSales = sales.reduce((sum, sale) => sum + calculateCorrectTotal(sale), 0);
  const gotovinaSales = sales.filter(sale => sale.payment_status === 'gotovina');
  const racunSales = sales.filter(sale => sale.payment_status === 'racun');
  const totalGotovina = gotovinaSales.reduce((sum, sale) => sum + calculateCorrectTotal(sale), 0);
  const totalRacun = racunSales.reduce((sum, sale) => sum + calculateCorrectTotal(sale), 0);

  return (
    <div className="pt-4 border-t space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Gotovina:</span>
        <span className="font-bold">{totalGotovina.toFixed(2)} RSD</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Račun:</span>
        <span className="font-bold">{totalRacun.toFixed(2)} RSD</span>
      </div>
      <div className="flex justify-between items-center text-base pt-2 border-t">
        <span className="font-medium">Ukupno za danas:</span>
        <span className="font-bold">{totalSales.toFixed(2)} RSD</span>
      </div>
    </div>
  );
};
