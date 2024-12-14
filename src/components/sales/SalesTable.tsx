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
    return <p className="text-muted-foreground">Nema porudžbina za danas</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kupac</TableHead>
          <TableHead>Adresa</TableHead>
          <TableHead>Način plaćanja</TableHead>
          <TableHead className="text-right">Iznos</TableHead>
          <TableHead className="text-center">Broj stavki</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow 
            key={sale.id}
            className={sentOrderIds.includes(sale.id) ? "text-red-500" : ""}
          >
            <TableCell>{sale.customer.name}</TableCell>
            <TableCell>
              {sale.customer.address}, {sale.customer.city}
            </TableCell>
            <TableCell>
              {sale.paymentType === 'cash' ? 'Gotovina' : 'Račun'}
            </TableCell>
            <TableCell className="text-right">{sale.total} RSD</TableCell>
            <TableCell className="text-center">{sale.items.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};