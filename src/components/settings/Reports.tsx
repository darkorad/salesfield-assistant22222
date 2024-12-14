import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateDailyReport, generateMonthlyReport, generateProductReport } from "@/utils/report-utils";

export const Reports = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Izveštaji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={generateDailyReport}
        >
          Izvezi dnevni izveštaj prodaje
        </Button>
        <Button
          className="w-full"
          onClick={generateMonthlyReport}
        >
          Izvezi mesečni izveštaj prodaje
        </Button>
        <Button
          className="w-full"
          onClick={generateProductReport}
        >
          Izvezi mesečni pregled proizvoda
        </Button>
      </CardContent>
    </Card>
  );
};