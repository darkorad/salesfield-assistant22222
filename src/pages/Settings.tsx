import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Customer, Product } from "@/types";
import * as XLSX from "xlsx";

const Settings = () => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (type === "customers") {
          localStorage.setItem("customers", JSON.stringify(jsonData));
          toast.success("Customer list uploaded successfully");
        } else if (type === "products") {
          localStorage.setItem("products", JSON.stringify(jsonData));
          toast.success("Price list uploaded successfully");
        }
      } catch (error) {
        toast.error(`Error processing ${type} file`);
        console.error(error);
      }
    };

    reader.onerror = () => {
      toast.error(`Error reading ${type} file`);
    };

    reader.readAsBinaryString(file);
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
                onChange={(e) => handleFileUpload(e, "customers")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Price List (Excel)
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, "products")}
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