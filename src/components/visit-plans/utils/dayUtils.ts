
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

// Create a map of similar day names for better matching
export const getDaySimilarityMap = () => ({
  'ponedeljak': ['ponedeljak', 'pon', 'monday', 'mon'],
  'utorak': ['utorak', 'uto', 'tuesday', 'tue'],
  'sreda': ['sreda', 'sre', 'wednesday', 'wed'],
  'četvrtak': ['četvrtak', 'cet', 'cetvrtak', 'thursday', 'thu'],
  'petak': ['petak', 'pet', 'friday', 'fri'],
  'subota': ['subota', 'sub', 'saturday', 'sat'],
  'nedelja': ['nedelja', 'ned', 'sunday', 'sun']
});

// Compare days using the similarity map
export const areDaysSimilar = (day1: string, day2: string): boolean => {
  const normalizedDay1 = normalizeDay(day1);
  const normalizedDay2 = normalizeDay(day2);
  
  // If direct match after normalization
  if (normalizedDay1 === normalizedDay2) {
    return true;
  }
  
  // Check using similarity map
  const dayMap = getDaySimilarityMap();
  
  for (const [key, variations] of Object.entries(dayMap)) {
    const day1InVariations = variations.some(v => normalizedDay1.includes(v.toLowerCase()));
    const day2InVariations = variations.some(v => normalizedDay2.includes(v.toLowerCase()));
    
    if (day1InVariations && day2InVariations) {
      return true;
    }
  }
  
  return false;
};
