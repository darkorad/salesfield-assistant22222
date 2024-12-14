import { Order } from "@/types";
import { SalesTable } from "../sales/SalesTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PreviewTableProps {
  type: 'daily' | 'monthly' | 'products' | null;
  data: any[];
}

export const PreviewTable = ({ type, data }: PreviewTableProps) => {
  if (!type) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">
        {type === 'daily' && "Dnevni izveštaj"}
        {type === 'monthly' && "Mesečni izveštaj"}
        {type === 'products' && "Pregled proizvoda"}
      </h3>
      <div className="border rounded-lg overflow-x-auto">
        {(type === 'daily' || type === 'monthly') && (
          <div className="max-w-[100vw] overflow-x-auto">
            <SalesTable sales={data as Order[]} sentOrderIds={[]} />
          </div>
        )}
        {type === 'products' && (
          <div className="max-w-[100vw] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Proizvod</TableHead>
                  <TableHead className="whitespace-nowrap">Proizvođač</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Ukupna količina</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Ukupna vrednost (RSD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">{item['Proizvod']}</TableCell>
                    <TableCell className="whitespace-nowrap">{item['Proizvođač']}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{item['Ukupna količina']}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{item['Ukupna vrednost (RSD)']}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};