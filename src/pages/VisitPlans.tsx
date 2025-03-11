
import { useState } from "react";
import { Customer } from "@/types";
import { VisitPlansHeader } from "@/components/visit-plans/VisitPlansHeader";
import { VisitPlanTabs } from "@/components/visit-plans/VisitPlanTabs";
import { TodayVisitsSection } from "@/components/visit-plans/TodayVisitsSection";
import { useVisitPlansData } from "@/components/visit-plans/hooks/useVisitPlansData";

const getCurrentDayInSerbian = () => {
  const day = new Date().toLocaleString('sr-Latn-RS', { weekday: 'long' }).toLowerCase();
  const dayMap: { [key: string]: string } = {
    'ponedeljak': 'ponedeljak',
    'utorak': 'utorak',
    'sreda': 'sreda',
    'četvrtak': 'četvrtak',
    'petak': 'petak',
    'subota': 'subota',
    'nedelja': 'nedelja',
    'monday': 'ponedeljak',
    'tuesday': 'utorak',
    'wednesday': 'sreda',
    'thursday': 'četvrtak',
    'friday': 'petak',
    'saturday': 'subota',
    'sunday': 'nedelja'
  };
  return dayMap[day] || day;
};

const VisitPlans = () => {
  const { visitPlans, customers, isLoading, error, fetchData } = useVisitPlansData();
  const [selectedDay, setSelectedDay] = useState(getCurrentDayInSerbian());

  return (
    <div className="container mx-auto p-2">
      <VisitPlansHeader error={error} onRetry={fetchData} />
      
      {!error && (
        <>
          <VisitPlanTabs 
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            customers={customers}
          />

          <TodayVisitsSection 
            isLoading={isLoading}
            visitPlans={visitPlans}
          />
        </>
      )}
    </div>
  );
};

export default VisitPlans;
