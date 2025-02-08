
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
          {sales.map((sale) => (
            <TableRow 
              key={sale.id}
              className={`${sentOrderIds.includes(sale.id) ? "text-red-500" : ""} ${
                sale.payment_type === 'cash' ? "bg-blue-50" : ""
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
                {sale.payment_type === 'cash' ? 'Gotovina' : 'Račun'}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-sm">
                {sale.total} RSD
              </TableCell>
              <TableCell className="text-center whitespace-nowrap text-sm">
                {sale.items.length}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
