export interface Customer {
  id: string;
  user_id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  pib: string;
  is_vat_registered: boolean;
  gps_coordinates?: string;
}