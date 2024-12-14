import { Order } from "@/types";

interface SalesTableProps {
  sales: Order[];
}

export const SalesTable = ({ sales }: SalesTableProps) => {
  if (sales.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Nema porudžbina za danas
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sales.map((sale, index) => (
        <div
          key={sale.id}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-2 gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{index + 1}.</span>
            <span className="font-medium">{sale.customer.name}</span>
          </div>
          <div className="flex justify-between w-full md:w-auto gap-2">
            <span className="md:hidden">Ukupno:</span>
            <span className="font-medium">{sale.total} RSD</span>
          </div>
        </div>
      ))}
    </div>
  );
};