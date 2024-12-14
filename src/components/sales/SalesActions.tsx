import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Contact {
  name: string;
  viber: string;
}

interface SalesActionsProps {
  contacts: {
    email: string;
    contacts: Contact[];
  };
  sales: Order[];
  onOrdersSent: (sentOrderIds: string[]) => void;
}

export const SalesActions = ({ contacts, sales, onOrdersSent }: SalesActionsProps) => {
  const handleSendViber = (contact: Contact) => {
    if (!contact.viber) {
      toast.error(`Viber broj za ${contact.name} nije podešen`);
      return;
    }
    const message = `Dnevni izveštaj prodaje:\n${sales
      .map(
        (sale) =>
          `${sale.customer.name}: ${sale.total} RSD (${sale.items.length} stavki)`
      )
      .join("\n")}`;
    toast.success(`Izveštaj poslat na Viber: ${contact.name}`);
  };

  const handleSendEmail = () => {
    if (!contacts.email) {
      toast.error("Email adresa nije podešena");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const salesData: any[] = [];

    sales.forEach((sale) => {
      // Add customer header
      salesData.push([]);
      salesData.push(['Kupac:', sale.customer.name]);
      salesData.push(['Adresa:', `${sale.customer.address}, ${sale.customer.city}`]);
      salesData.push([]);
      
      // Add items header
      salesData.push(['Proizvod', 'Proizvođač', 'Količina', 'Cena', 'Ukupno']);
      
      // Add items
      sale.items.forEach((item) => {
        salesData.push([
          item.product.name,
          item.product.manufacturer,
          `${item.quantity} ${item.product.unit}`,
          `${item.product.price} RSD`,
          `${item.product.price * item.quantity} RSD`
        ]);
      });
      
      // Add order total
      salesData.push([]);
      salesData.push(['Ukupno za kupca:', '', '', '', `${sale.total} RSD`]);
      salesData.push([]);
      salesData.push([]);
    });

    // Add grand total
    salesData.push([]);
    salesData.push([
      'Ukupno za danas:',
      '',
      '',
      '',
      `${sales.reduce((sum, sale) => sum + sale.total, 0)} RSD`
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(salesData);

    // Set column widths
    const colWidths = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Dnevni izveštaj");
    
    const today = new Date().toLocaleDateString("sr-RS");
    XLSX.writeFile(workbook, `dnevni-izvestaj-${today}.xlsx`);
    
    // Mark orders as sent
    const sentOrderIds = sales.map(sale => sale.id);
    onOrdersSent(sentOrderIds);
    
    toast.success("Excel izveštaj je uspešno kreiran");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {contacts.contacts.map((contact) => (
        <Button
          key={contact.name}
          onClick={() => handleSendViber(contact)}
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Viber {contact.name}
        </Button>
      ))}
      <Button onClick={handleSendEmail} className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>
    </div>
  );
};