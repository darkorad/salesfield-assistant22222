
import { extractCustomerData } from './fetchSalesData';

/**
 * Process the sales data and create report data
 */
export const processReportData = (salesData: any[]) => {
  // Create flat array of all items from all sales
  const reportData = salesData.flatMap(sale => {
    // Get customer data safely
    const customer = extractCustomerData(sale.customer, sale.darko_customer);
    
    const items = sale.items as any[];
    if (!items || !Array.isArray(items)) {
      console.warn(`No items or invalid items for sale ${sale.id}`);
      return [];
    }

    return items.map(item => ({
      'Datum': new Date(sale.date).toLocaleString('sr-RS'),
      'Kupac': customer.name,
      'PIB': customer.pib,
      'Adresa': customer.address,
      'Grad': customer.city,
      'Proizvod': item.product.Naziv,
      'Proizvođač': item.product.Proizvođač,
      'Količina': item.quantity,
      'Jedinica mere': item.product["Jedinica mere"],
      'Cena': item.price || item.product.Cena,
      'Ukupno': (item.quantity * (item.price || item.product.Cena)),
      'Način plaćanja': item.paymentType === 'cash' ? 'Gotovina' : 'Račun'
    }));
  });

  return reportData;
};

/**
 * Calculate totals from report data
 */
export const calculateTotals = (reportData: any[]) => {
  // Calculate totals by payment type
  const cashTotal = reportData
    .filter(item => item['Način plaćanja'] === 'Gotovina')
    .reduce((sum, item) => sum + item['Ukupno'], 0);
  
  const invoiceTotal = reportData
    .filter(item => item['Način plaćanja'] === 'Račun')
    .reduce((sum, item) => sum + item['Ukupno'], 0);
  
  const grandTotal = cashTotal + invoiceTotal;

  // Group data by customer for customer totals
  const customerTotals: Record<string, { name: string, address: string, total: number }> = {};
  
  reportData.forEach(item => {
    const customerKey = item['Kupac'];
    if (!customerTotals[customerKey]) {
      customerTotals[customerKey] = {
        name: item['Kupac'],
        address: item['Adresa'],
        total: 0
      };
    }
    customerTotals[customerKey].total += item['Ukupno'];
  });

  return {
    cashTotal,
    invoiceTotal,
    grandTotal,
    customerTotals
  };
};
