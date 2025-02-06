import { Customer } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "lucide-react";

interface DayScheduleProps {
  day: string;
  customers: Customer[];
}

export const DaySchedule = ({ day, customers }: DayScheduleProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          {day}
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kupac</TableHead>
            <TableHead>Adresa</TableHead>
            <TableHead>Grad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell>{customer.city}</TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                Nema planiranih poseta za ovaj dan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};