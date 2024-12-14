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
      <html>
      <head>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; }
          .order-header { background-color: #e9ecef; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .items-table { margin-left: 20px; margin-bottom: 20px; width: calc(100% - 20px); }
          .items-table th, .items-table td { background-color: white; }
        </style>
      </head>
      <body>
        <h2>Dnevni izveštaj prodaje</h2>
        ${sales
          .map(
            (sale) => `
            <div class="order-header" style="padding: 12px; margin: 10px 0;">
              <strong>Kupac:</strong> ${sale.customer.name}<br>
              <strong>Adresa:</strong> ${sale.customer.address}, ${sale.customer.city}
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th>Proizvođač</th>
                  <th>Količina</th>
                  <th>Cena</th>
                  <th>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.product.name}</td>
                    <td>${item.product.manufacturer}</td>
                    <td>${item.quantity} ${item.product.unit}</td>
                    <td>${item.product.price} RSD</td>
                    <td>${item.product.price * item.quantity} RSD</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">Ukupno za kupca:</td>
                  <td>${sale.total} RSD</td>
                </tr>
              </tbody>
            </table>
          `
          )
          .join("")}
        <div class="total-row" style="padding: 12px; margin-top: 20px; text-align: right;">
          <strong>Ukupno za danas: ${sales.reduce(
            (sum, sale) => sum + sale.total,
            0
          )} RSD</strong>
        </div>
      </body>
      </html>
    `;

    const mailtoLink = `mailto:${
      contacts.email
    }?subject=Dnevni izveštaj prodaje - ${new Date().toLocaleDateString(
      "sr-RS"
    )}&body=${encodeURIComponent(emailBody)}`;
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