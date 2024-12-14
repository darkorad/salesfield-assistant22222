import * as XLSX from 'xlsx';

const sampleCustomers = [
  { id: "1", name: "Kupac 1", address: "Adresa 1", city: "Grad 1", phone: "123-456" },
  { id: "2", name: "Kupac 2", address: "Adresa 2", city: "Grad 2", phone: "234-567" },
  { id: "3", name: "Kupac 3", address: "Adresa 3", city: "Grad 3", phone: "345-678" }
];

const sampleProducts = [
  { id: "1", name: "Proizvod 1", manufacturer: "Proizvođač 1", price: 100, unit: "kom" },
  { id: "2", name: "Proizvod 2", manufacturer: "Proizvođač 2", price: 200, unit: "kom" },
  { id: "3", name: "Proizvod 3", manufacturer: "Proizvođač 3", price: 300, unit: "kom" }
];

export const initializeData = () => {
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(sampleCustomers));
    localStorage.setItem('lastCustomersImport', new Date().toISOString());
  }

  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(sampleProducts));
    localStorage.setItem('lastProductsImport', new Date().toISOString());
  }
};