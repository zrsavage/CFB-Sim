export const FIRST_NAMES = [
  "James", "Michael", "David", "Chris", "Jordan", "Marcus", "Tyler", "Brandon",
  "Justin", "Andre", "DeShawn", "Malik", "Trevon", "Xavier", "Isaiah", "Elijah",
  "Cameron", "Jalen", "Devin", "Aaron", "Caleb", "Josiah", "Dominic", "Tre",
  "Kaden", "Carter", "Wyatt", "Blake", "Hunter", "Colt", "Grant", "Jaxon",
  "Amir", "Davion", "Kobe", "Zion", "Nasir", "Rashad", "Tyrone", "Jamal",
  "Ethan", "Noah", "Logan", "Mason", "Landon", "Cooper", "Dawson", "Garrett",
  "Antoine", "Terrence", "Deion", "Quinton", "Javon", "Keon", "Darnell", "Reggie",
] as const;

export const LAST_NAMES = [
  "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Wilson",
  "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez",
  "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Green",
  "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips",
  "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Morris", "Murphy",
  "Cook", "Rogers", "Bell", "Cooper", "Richardson", "Cox", "Howard", "Ward",
] as const;

export const CITIES = [
  "Riverside", "Fairview", "Midland", "Brookhaven", "Clearwater", "Silverton",
  "Ashford", "Kingsport", "Millbrook", "Eastwood", "Westfield", "Oakdale",
  "Pinecrest", "Lakeview", "Summit", "Greenville", "Hartland", "Bakersfield",
  "Centerville", "Fairhope",
] as const;

export const TEAM_MASCOTS = [
  "Wolves", "Hawks", "Bears", "Tigers", "Eagles", "Lions", "Panthers", "Cougars",
  "Bulldogs", "Raiders", "Knights", "Gators", "Longhorns", "Rams", "Falcons",
  "Bison", "Mustangs", "Titans", "Vikings", "Hurricanes",
] as const;

export const TEAM_CITIES = [
  "Riverside", "Ashford", "Kingsport", "Millbrook", "Eastwood", "Westfield",
  "Oakdale", "Pinecrest", "Lakeview", "Summit", "Greenville", "Hartland",
  "Bakersfield", "Centerville", "Fairhope", "Draperton", "Nova City", "Grantham",
  "Shoreline", "Carsonville",
] as const;

export function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
