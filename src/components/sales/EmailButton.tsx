
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

interface EmailButtonProps {
  email?: string;
  sales: Order[];
  onOrdersSent: (sentOrderIds: string[]) => void;
}

export const EmailButton = ({ email, sales, onOrdersSent }: EmailButtonProps) => {
  const handleClick = () => {
    if (!email) {
      toast.error("Email adresa nije dostupna");
      return;
    }

    const sentOrderIds = sales.map(sale => sale.id);
    onOrdersSent(sentOrderIds);
    window.location.href = `mailto:${email}`;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!email}
      className="gap-2"
    >
      <Mail className="h-4 w-4" />
      Email
    </Button>
  );
};
