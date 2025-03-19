
import React from "react";
import { SalesTable } from "../SalesTable";
import { Order } from "@/types";

interface SalesTableSectionProps {
  sales: Order[];
}

export const SalesTableSection = ({ sales }: SalesTableSectionProps) => {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="min-w-full inline-block align-middle text-right">
        <SalesTable sales={sales} sentOrderIds={[]} />
      </div>
    </div>
  );
};
