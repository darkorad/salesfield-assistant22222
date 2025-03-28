
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
  'ponedeljak': ['ponedeljak', 'pon', 'monday', 'mon', 'пон', 'понедељак', 'ponedeljkom'],
  'utorak': ['utorak', 'uto', 'tuesday', 'tue', 'уто', 'уторак', 'utorkom'],
  'sreda': ['sreda', 'sre', 'wednesday', 'wed', 'сре', 'среда', 'sredom'],
  'četvrtak': ['četvrtak', 'cet', 'cetvrtak', 'thursday', 'thu', 'чет', 'четвртак', 'cetvrtkom'],
  'petak': ['petak', 'pet', 'friday', 'fri', 'пет', 'петак', 'petkom'],
  'subota': ['subota', 'sub', 'saturday', 'sat', 'суб', 'субота', 'subotom'],
  'nedelja': ['nedelja', 'ned', 'sunday', 'sun', 'нед', 'недеља', 'nedeljom']
});

// Compare days using the similarity map with improved matching
export const areDaysSimilar = (day1: string, day2: string): boolean => {
  if (!day1 || !day2) return false;
  
  // If direct match after normalization
  if (day1 === day2) {
    return true;
  }
  
  // Check using similarity map
  const dayMap = getDaySimilarityMap();
  
  for (const [key, variations] of Object.entries(dayMap)) {
    // Check if either day exactly matches any variation
    const day1ExactMatch = variations.some(v => day1 === normalizeDay(v));
    const day2ExactMatch = variations.some(v => day2 === normalizeDay(v));
    
    // Check if either day includes any variation
    const day1PartialMatch = variations.some(v => day1.includes(normalizeDay(v)));
    const day2PartialMatch = variations.some(v => day2.includes(normalizeDay(v)));
    
    // Match if both days are in the same variation group
    if ((day1ExactMatch || day1PartialMatch) && (day2ExactMatch || day2PartialMatch)) {
      return true;
    }
  }
  
  return false;
};
