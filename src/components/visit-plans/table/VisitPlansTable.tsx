
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WifiOff } from "lucide-react";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

interface VisitPlansTableProps {
  visitPlans: VisitPlan[];
  isLoading: boolean;
  isOffline?: boolean;
}

export const VisitPlansTable = ({ visitPlans, isLoading, isOffline }: VisitPlansTableProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

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
        {visitPlans.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-gray-500">
              Nema planiranih poseta za danas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
