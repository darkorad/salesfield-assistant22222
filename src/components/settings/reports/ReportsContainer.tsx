
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CashSalesReport } from "./CashSalesReport";
import { DailyReportButton } from "./DailyReportButton";
import { MonthlyReportButtons } from "./MonthlyReportButtons";
import { createRedirectToDocuments } from "@/utils/fileExport";
import { FileSpreadsheet } from "lucide-react";

export const ReportsContainer = () => {
  const navigate = useNavigate();
  const redirectToDocuments = createRedirectToDocuments(navigate);

  return (
    <Card className="border-t-4 border-t-cyan-500 shadow-md mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-cyan-500" />
              Izvoz izveštaja
            </CardTitle>
            <CardDescription>
              Kreirajte i preuzmite različite tipove izveštaja
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dnevni izveštaji</h3>
            <DailyReportButton redirectToDocuments={redirectToDocuments} />
            <CashSalesReport redirectToDocuments={redirectToDocuments} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mesečni izveštaji</h3>
            <MonthlyReportButtons redirectToDocuments={redirectToDocuments} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
