import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PreviewTableProps {
  type: 'daily' | 'monthly' | 'products' | null;
  data: any[];
}

export const PreviewTable = ({ type, data }: PreviewTableProps) => {
  if (!type || !data || data.length === 0) return null;

  const renderDailyTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kupac</TableHead>
          <TableHead>Adresa</TableHead>
          <TableHead>Artikli</TableHead>
          <TableHead className="text-right">Ukupno (RSD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row['Kupac']}</TableCell>
            <TableCell>{row['Adresa']}</TableCell>
            <TableCell>{row['Artikli']}</TableCell>
            <TableCell className="text-right">{row['Ukupno (RSD)']}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="mt-6 border rounded-lg overflow-x-auto">
      {renderDailyTable()}
    </div>
  );
};