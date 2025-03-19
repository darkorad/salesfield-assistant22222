
import { toast } from "sonner";

/**
 * Get the current month date range
 */
export function getMonthDateRange() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  console.log(`Generating report for month: ${firstDayOfMonth.toLocaleDateString('sr-RS')} to ${firstDayOfNextMonth.toLocaleDateString('sr-RS')}`);
  
  return {
    firstDayOfMonth,
    firstDayOfNextMonth,
    today
  };
}

/**
 * Get the month name in Serbian
 */
export function getMonthNameInSerbian(date: Date = new Date()): string {
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  return monthNames[date.getMonth()];
}

/**
 * Format filename with current month and year
 */
export function formatFilename() {
  const today = new Date();
  const monthName = getMonthNameInSerbian(today);
  const year = today.getFullYear();
  
  // Format: Mesecni-Izvestaj-Kupci-Mart-2025
  return `Mesecni-Izvestaj-Kupci-${monthName}-${year}`;
}
