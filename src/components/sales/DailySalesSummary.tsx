import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncDataButton } from "./SyncDataButton";
import { LoadingState } from "./daily/LoadingState";
import { SalesTableSection } from "./daily/SalesTableSection";
import { TotalsSummary } from "./daily/TotalsSummary";
import { useDailySales } from "./daily/useDailySales";

const DailySalesSummary = () => {
  const { todaySales, isLoading, loadTodaySales } = useDailySales();

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Današnje porudžbine</CardTitle>
        <SyncDataButton onSyncComplete={loadTodaySales} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <SalesTableSection sales={todaySales} />
              {todaySales.length > 0 && <TotalsSummary sales={todaySales} />}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;