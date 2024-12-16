import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "./ExportButton";
import { useExportData } from "@/hooks/use-export-data";

export const ExportData = () => {
  const { exportCustomers, exportProducts } = useExportData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izveštaji i napisi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExportButton 
          onClick={exportCustomers}
          label="Izvezi listu kupaca (CSV)"
        />
        <ExportButton 
          onClick={exportProducts}
          label="Izvezi cenovnik (CSV)"
        />
      </CardContent>
    </Card>
  );
};