
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface EmailButtonProps {
  email?: string;
}

export const EmailButton = ({ email }: EmailButtonProps) => {
  const handleClick = () => {
    if (!email) {
      toast.error("Email adresa nije dostupna");
      return;
    }
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
