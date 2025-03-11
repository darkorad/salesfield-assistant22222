
/**
 * Process sales data into customer details and summary information
 */
export const processCustomerSales = (sales: any[]) => {
  const customerSalesDetails = {};
  const customerSalesSummary = {};
  
  sales.forEach(sale => {
    const customer = sale.customer_id ? sale.customers : sale.kupci_darko;
    const customerId = sale.customer_id || sale.darko_customer_id || 'unknown';
    const customerName = customer?.name || 'Nepoznat kupac';
    const items = sale.items as any[];
    
    // Initialize customer entries if they don't exist
    if (!customerSalesDetails[customerId]) {
      customerSalesDetails[customerId] = {
        name: customerName,
        address: customer?.address || '',
        city: customer?.city || '',
        pib: customer?.pib || '',
        items: []
      };
    }

    if (!customerSalesSummary[customerId]) {
      customerSalesSummary[customerId] = {
        name: customerName,
        address: customer?.address || '',
        city: customer?.city || '',
        pib: customer?.pib || '',
        totalCash: 0,
        totalInvoice: 0,
        totalAmount: 0
      };
    }
    
    // Add items to customer details
    items.forEach(item => {
      customerSalesDetails[customerId].items.push({
        date: new Date(sale.created_at).toLocaleDateString('sr-RS'),
        product: item.product.Naziv,
        manufacturer: item.product.Proizvođač,
        unit: item.product["Jedinica mere"],
        quantity: item.quantity,
        price: item.product.Cena,
        total: item.quantity * item.product.Cena,
        payment_type: sale.payment_type === 'cash' ? 'Gotovina' : 'Račun'
      });
    });
    
    // Update customer summary
    if (sale.payment_type === 'cash') {
      customerSalesSummary[customerId].totalCash += sale.total;
    } else {
      customerSalesSummary[customerId].totalInvoice += sale.total;
    }
    customerSalesSummary[customerId].totalAmount += sale.total;
  });

  return { customerSalesDetails, customerSalesSummary };
};
