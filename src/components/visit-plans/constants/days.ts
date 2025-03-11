
export const DAYS_OF_WEEK = [
  "ponedeljak",
  "utorak",
  "sreda",
  "četvrtak",
  "petak",
  "subota",
  "nedelja"
];

// Split days into two rows for better mobile display
export const FIRST_ROW = DAYS_OF_WEEK.slice(0, 4); // Mon-Thu
export const SECOND_ROW = DAYS_OF_WEEK.slice(4); // Fri-Sun
