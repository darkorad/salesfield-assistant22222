import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types";
import { format } from "date-fns";

interface SalesTableProps {
  sales: Order[];
  sentOrderIds: string[];
}

export const SalesTable = ({ sales, sentOrderIds }: SalesTableProps) => {
  if (sales.length === 0) {
    return <p className="text-sm text-muted-foreground">Nema porudžbina za danas</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap text-xs md:text-sm">Kupac</TableHead>
            <TableHead className="whitespace-nowrap text-xs md:text-sm hidden md:table-cell">Adresa</TableHead>
            <TableHead className="whitespace-nowrap text-xs md:text-sm">Plaćanje</TableHead>
            <TableHead className="text-right whitespace-nowrap text-xs md:text-sm">Iznos</TableHead>
            <TableHead className="text-center whitespace-nowrap text-xs md:text-sm">Stavke</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow 
              key={sale.id}
              className={sentOrderIds.includes(sale.id) ? "text-red-500" : ""}
            >
              <TableCell className="whitespace-nowrap text-xs md:text-sm">
                <div>{sale.customer.name}</div>
                <div className="text-xs text-gray-500 md:hidden">{sale.customer.address}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                {sale.customer.address}, {sale.customer.city}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs md:text-sm">
                {sale.paymentType === 'cash' ? 'Gotovina' : 'Račun'}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap text-xs md:text-sm">{sale.total} RSD</TableCell>
              <TableCell className="text-center whitespace-nowrap text-xs md:text-sm">{sale.items.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};