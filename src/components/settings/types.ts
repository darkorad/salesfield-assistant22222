export interface CustomerFormData {
  name: string;
  address: string;
  city: string;
  phone: string;
  pib: string;
  isVatRegistered: boolean;
  gpsCoordinates: string;
  naselje: string;
}

export const initialCustomerFormData: CustomerFormData = {
  name: "",
  address: "",
  city: "",
  phone: "",
  pib: "",
  isVatRegistered: false,
  gpsCoordinates: "",
  naselje: ""
};