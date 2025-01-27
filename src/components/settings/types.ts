export interface CustomerFormData {
  name: string;
  address: string;
  city: string;
  phone: string;
  pib: string;
  isVatRegistered: boolean;
  gpsCoordinates: string;
  naselje: string;
  email?: string;
  visit_day?: string;
  visit_type?: 'visit' | 'call';
  visit_duration?: number;
  visit_notes?: string;
}

export const initialCustomerFormData: CustomerFormData = {
  name: "",
  address: "",
  city: "",
  phone: "",
  pib: "",
  isVatRegistered: false,
  gpsCoordinates: "",
  naselje: "",
  email: "",
  visit_day: "",
  visit_type: "visit",
  visit_duration: 30,
  visit_notes: ""
};