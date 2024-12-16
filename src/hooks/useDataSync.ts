import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CustomerTableNames = "KupciVeljko" | "Kupci Darko";
type ProductTableNames = "CenovnikVeljko";

type SourceTables = {
  customers: CustomerTableNames | null;
  products: ProductTableNames | null;
};

export const useDataSync = (onComplete: () => void) => {
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async (session: any) => {
    if (!session) return;
    
    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const username = user?.user_metadata?.username || '';
      
      let sourceTables: SourceTables = {
        customers: null,
        products: null
      };
      
      switch(username) {
        case 'veljko':
          sourceTables = {
            customers: "KupciVeljko",
            products: "CenovnikVeljko"
          };
          break;
        case 'darko':
          sourceTables = {
            customers: "Kupci Darko",
            products: null
          };
          break;
        default:
          onComplete();
          return;
      }

      // Sync customers if source table exists
      if (sourceTables.customers) {
        const { data: customersData, error: customersError } = await supabase
          .from(sourceTables.customers)
          .select('*');

        if (customersError) throw customersError;

        if (customersData) {
          await supabase
            .from('customers')
            .delete()
            .eq('user_id', session.user.id);

          const transformedCustomers = customersData.map(customer => ({
            user_id: session.user.id,
            code: customer['Šifra kupca'].toString(),
            name: customer['Naziv kupca'],
            address: customer['Adresa'],
            city: customer['Grad'],
            phone: customer['Telefon'],
            pib: customer['PIB'],
            is_vat_registered: customer['PDV Obveznik'] === 'DA',
            gps_coordinates: customer['GPS Koordinate']
          }));

          const batchSize = 20; // Increased batch size for better performance
          for (let i = 0; i < transformedCustomers.length; i += batchSize) {
            const batch = transformedCustomers.slice(i, i + batchSize);
            await supabase.from('customers').insert(batch);
            setSyncProgress((i + batchSize) / transformedCustomers.length * 50);
          }
        }
      }

      // Sync products if source table exists
      if (sourceTables.products) {
        const { data: productsData, error: productsError } = await supabase
          .from(sourceTables.products)
          .select('*');

        if (productsError) throw productsError;

        if (productsData) {
          await supabase
            .from('products')
            .delete()
            .eq('user_id', session.user.id);

          const transformedProducts = productsData.map(product => ({
            user_id: session.user.id,
            Naziv: product['Naziv'],
            Proizvođač: product['Proizvođač'],
            Cena: product['Cena'],
            'Jedinica mere': product['Jedinica mere']
          }));

          const batchSize = 20;
          for (let i = 0; i < transformedProducts.length; i += batchSize) {
            const batch = transformedProducts.slice(i, i + batchSize);
            await supabase.from('products').insert(batch);
            setSyncProgress(50 + (i + batchSize) / transformedProducts.length * 50);
          }
        }
      }

      toast.success('Successfully logged in and synced data');
      onComplete();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Error syncing data');
      onComplete();
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  return {
    syncData,
    isSyncing,
    syncProgress
  };
};