
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "./daily/LoadingState";
import { SalesTableSection } from "./daily/SalesTableSection";
import { TotalsSummary } from "./daily/TotalsSummary";
import { useDailySales } from "./daily/useDailySales";

const DailySalesSummary = () => {
  const { todaySales, isLoading } = useDailySales();

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Današnje porudžbine</CardTitle>
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
