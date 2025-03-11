
// Helper function to normalize day names for consistent comparison
export const normalizeDay = (day: string | undefined | null): string => {
  if (!day) return '';
  // Convert to lowercase, remove diacritics, trim spaces, and handle multiple spaces
  return day.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .replace(/\s+/g, ' ')
    .trim();
};

// Create a map of similar day names for better matching
export const getDaySimilarityMap = () => ({
  'ponedeljak': ['ponedeljak', 'pon', 'monday', 'mon', 'пон', 'понедељак'],
  'utorak': ['utorak', 'uto', 'tuesday', 'tue', 'уто', 'уторак'],
  'sreda': ['sreda', 'sre', 'wednesday', 'wed', 'сре', 'среда'],
  'četvrtak': ['četvrtak', 'cet', 'cetvrtak', 'thursday', 'thu', 'чет', 'четвртак'],
  'petak': ['petak', 'pet', 'friday', 'fri', 'пет', 'петак'],
  'subota': ['subota', 'sub', 'saturday', 'sat', 'суб', 'субота'],
  'nedelja': ['nedelja', 'ned', 'sunday', 'sun', 'нед', 'недеља']
});

// Compare days using the similarity map with improved matching
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
    // Check if either day exactly matches any variation
    const day1ExactMatch = variations.some(v => normalizedDay1 === v.toLowerCase());
    const day2ExactMatch = variations.some(v => normalizedDay2 === v.toLowerCase());
    
    // Check if either day includes any variation
    const day1PartialMatch = variations.some(v => normalizedDay1.includes(v.toLowerCase()));
    const day2PartialMatch = variations.some(v => normalizedDay2.includes(v.toLowerCase()));
    
    // Match if both days are in the same variation group
    if ((day1ExactMatch || day1PartialMatch) && (day2ExactMatch || day2PartialMatch)) {
      return true;
    }
  }
  
  return false;
};
