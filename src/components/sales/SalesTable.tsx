
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types";

interface SalesTableProps {
  sales: Order[];
  sentOrderIds: string[];
}

export const SalesTable = ({ sales, sentOrderIds }: SalesTableProps) => {
  if (sales.length === 0) {
    return <p className="text-sm text-muted-foreground">Nema porudžbina za danas</p>;
  }

  // Calculate correct total for each sale including quantity and unit measurements
  const calculateCorrectTotal = (sale: Order) => {
    return sale.items.reduce((sum, item) => {
      const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
      return sum + (item.product.Cena * item.quantity * unitSize);
    }, 0);
  };

  return (
    <div className="overflow-x-auto -mx-2 md:mx-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap text-sm min-w-[150px]">Kupac</TableHead>
            <TableHead className="whitespace-nowrap text-sm hidden md:table-cell min-w-[200px]">Adresa</TableHead>
            <TableHead className="whitespace-nowrap text-sm min-w-[100px]">Plaćanje</TableHead>
            <TableHead className="text-right whitespace-nowrap text-sm min-w-[100px]">Iznos</TableHead>
            <TableHead className="text-center whitespace-nowrap text-sm min-w-[80px]">Stavke</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const correctTotal = calculateCorrectTotal(sale);
            
            return (
              <TableRow 
                key={sale.id}
                className={`${sentOrderIds.includes(sale.id) ? "text-red-500" : ""} ${
                  sale.payment_status === 'gotovina' ? "bg-blue-50" : ""
                }`}
              >
                <TableCell className="whitespace-nowrap text-sm font-medium">
                  <div>{sale.customer?.name || 'Nepoznat kupac'}</div>
                  <div className="text-xs text-gray-500 md:hidden">
                    {sale.customer?.address || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm hidden md:table-cell">
                  {sale.customer ? 
                    `${sale.customer.address}${sale.customer.city ? `, ${sale.customer.city}` : ''}` 
                    : 'N/A'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium">
                  {sale.payment_status === 'gotovina' ? 'Gotovina' : 'Račun'}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-sm">
                  {correctTotal.toFixed(2)} RSD
                </TableCell>
                <TableCell className="text-center whitespace-nowrap text-sm">
                  {sale.items.length}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
