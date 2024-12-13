import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Settings = () => {
  const handleFileUpload = (type: string) => {
    // TODO: Implement actual file upload logic
    toast.success(`${type} file uploaded successfully`);
  };

  const handleExport = (type: string) => {
    // TODO: Implement actual export logic
    toast.success(`${type} exported successfully`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer List (Excel)
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={() => handleFileUpload("Customer list")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Price List (Excel)
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={() => handleFileUpload("Price list")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => handleExport("Daily sales report")}
            >
              Export Daily Sales Report
            </Button>
            <Button
              className="w-full"
              onClick={() => handleExport("Monthly sales report")}
            >
              Export Monthly Sales Report
            </Button>
            <Button
              className="w-full"
              onClick={() => handleExport("Monthly product summary")}
            >
              Export Monthly Product Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;