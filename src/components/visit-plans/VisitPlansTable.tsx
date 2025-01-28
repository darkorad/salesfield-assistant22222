import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  dan_obilaska: string | null;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

interface VisitPlansTableProps {
  visitPlans: VisitPlan[];
}

export const VisitPlansTable = ({ visitPlans }: VisitPlansTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kupac</TableHead>
          <TableHead>Adresa</TableHead>
          <TableHead>Vreme</TableHead>
          <TableHead>Napomene</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visitPlans.map((visit) => (
          <TableRow key={visit.id}>
            <TableCell>{visit.customer?.name}</TableCell>
            <TableCell>
              {visit.customer?.address}, {visit.customer?.city}
            </TableCell>
            <TableCell>{visit.visit_time}</TableCell>
            <TableCell>{visit.notes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};