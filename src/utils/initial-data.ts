export const initializeData = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  // Initialize user-specific storage keys if they don't exist
  const userCustomers = localStorage.getItem(`customers_${currentUser}`);
  const userProducts = localStorage.getItem(`products_${currentUser}`);
  const userSales = localStorage.getItem(`sales_${currentUser}`);

  if (!userCustomers) {
    localStorage.setItem(`customers_${currentUser}`, JSON.stringify([]));
  }
  if (!userProducts) {
    localStorage.setItem(`products_${currentUser}`, JSON.stringify([]));
  }
  if (!userSales) {
    localStorage.setItem(`sales_${currentUser}`, JSON.stringify([]));
  }
};