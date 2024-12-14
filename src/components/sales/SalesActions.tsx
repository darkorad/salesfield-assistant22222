import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";

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
}

export const SalesActions = ({ contacts, sales }: SalesActionsProps) => {
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

    const emailBody = `
      <h2>Dnevni izveštaj prodaje</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Kupac</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Iznos</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Broj stavki</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${sale.customer.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${sale.total} RSD</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sale.items.length}</td>
            </tr>
          `).join('')}
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Ukupno</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">
              ${sales.reduce((sum, sale) => sum + sale.total, 0)} RSD
            </td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">
              ${sales.reduce((sum, sale) => sum + sale.items.length, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const mailtoLink = `mailto:${contacts.email}?subject=Dnevni izveštaj prodaje&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    toast.success("Email klijent je otvoren sa izveštajem");
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