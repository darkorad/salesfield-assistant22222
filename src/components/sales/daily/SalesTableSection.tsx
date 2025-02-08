
import React from "react";
import { SalesTable } from "../SalesTable";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesTableSectionProps {
  sales: Order[];
}

export const SalesTableSection = ({ sales }: SalesTableSectionProps) => {
  const completedCustomerIds = new Set(sales.map(sale => sale.customer?.id));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-full inline-block align-middle">
          <SalesTable sales={sales} sentOrderIds={[]} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Današnje posete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Završeno porudžbina: {completedCustomerIds.size}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
