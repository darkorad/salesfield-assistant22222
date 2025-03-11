
// Helper function to normalize day names for consistent comparison
export const normalizeDay = (day: string | undefined | null): string => {
  if (!day) return '';
  // Convert to lowercase, remove diacritics, and trim spaces
  return day.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .trim();
};
