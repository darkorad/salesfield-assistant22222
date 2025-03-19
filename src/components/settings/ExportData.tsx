
import { DataManagement } from "./data-management/DataManagement";
import { ReportsContainer } from "./reports/ReportsContainer";
import { FileLocationGuide } from "./reports/FileLocationGuide";

export const ExportData = () => {
  return (
    <>
      <FileLocationGuide />
      <ReportsContainer />
      <DataManagement />
    </>
  );
};
