import { Order } from "@/types";
import { ViberButton } from "./ViberButton";
import { EmailButton } from "./EmailButton";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {contacts.contacts.map((contact) => (
        <ViberButton
          key={contact.name}
          contact={contact}
          sales={sales}
          onOrdersSent={onOrdersSent}
        />
      ))}
      <EmailButton
        email={contacts.email}
        sales={sales}
        onOrdersSent={onOrdersSent}
      />
    </div>
  );
};