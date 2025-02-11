import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Order } from "@/types";
import { generateSalesReport } from "@/utils/excelReportUtils";

interface EmailButtonProps {
  email: string;
  sales: Order[];
  onOrdersSent: (sentOrderIds: string[]) => void;
}

export const EmailButton = ({ email, sales, onOrdersSent }: EmailButtonProps) => {
  const handleSendEmail = () => {
    if (!email) {
      toast.error("Email adresa nije podešena");
      return;
    }

    const workbook = generateSalesReport(sales);
    const today = new Date().toLocaleDateString("sr-RS");
    
    // Generate Excel file
    XLSX.writeFile(workbook, `dnevni-izvestaj-${today}.xlsx`);
    
    // Create mailto link with subject
    const mailtoLink = `mailto:${email}?subject=Dnevni izveštaj prodaje - ${today}&body=U prilogu je dnevni izveštaj prodaje.`;
    window.location.href = mailtoLink;
    
    // Mark orders as sent
    const sentOrderIds = sales.map(sale => sale.id);
    onOrdersSent(sentOrderIds);
    
    toast.success("Excel izveštaj je uspešno kreiran i email je pripremljen");
  };

  return (
    <Button onClick={handleSendEmail} className="w-full">
      <Mail className="mr-2 h-4 w-4" />
      Email
    </Button>
  );
};