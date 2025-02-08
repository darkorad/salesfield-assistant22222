
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types";
import { format } from "date-fns";

interface SalesTableProps {
  sales: Order[];
  sentOrderIds: string[];
}

export const SalesTable = ({ sales, sentOrderIds }: SalesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vreme</TableHead>
          <TableHead>Kupac</TableHead>
          <TableHead>Tip plaćanja</TableHead>
          <TableHead className="text-right">Iznos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow 
            key={sale.id}
            className={sentOrderIds.includes(sale.id) ? "opacity-50" : ""}
          >
            <TableCell>{format(new Date(sale.date || ''), 'HH:mm')}</TableCell>
            <TableCell>{sale.customer?.name || 'Nepoznat kupac'}</TableCell>
            <TableCell>{sale.payment_type === 'cash' ? 'Gotovina' : 'Račun'}</TableCell>
            <TableCell className="text-right">{sale.total.toFixed(2)} RSD</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
