import type { Division } from "../../../shared/types.js";

export interface CfbTeamSeed {
  name: string;
  mascot: string;
  conference: string;
  division: Division;
  basePrestige: number;
}

function seed(
  name: string,
  mascot: string,
  conference: string,
  division: Division,
  basePrestige: number
): CfbTeamSeed {
  return { name, mascot, conference, division, basePrestige };
}

// Fictional conferences loosely modeled on the real Power/Group-of-Five
// structure, so the league "feels" like real college football without
// using real school or conference names.
export const MAGNOLIA = "Magnolia Conference"; // SEC-like
export const HEARTLAND = "Heartland Conference"; // Big Ten-like
export const SEABOARD = "Seaboard Conference"; // ACC-like
export const FRONTIER = "Frontier Conference"; // Big 12-like

export const COASTAL_AMERICAN = "Coastal American Conference"; // AAC-like
export const HERITAGE = "Heritage Conference"; // Conference USA-like
export const GREAT_LAKES = "Great Lakes Conference"; // MAC-like
export const SUMMIT_WEST = "Summit West Conference"; // Mountain West-like
export const GULF_COAST = "Gulf Coast Conference"; // Sun Belt-like

export const INDEPENDENTS = "Independents";

export const POWER_CONFERENCES = [MAGNOLIA, HEARTLAND, SEABOARD, FRONTIER];
export const GROUP5_CONFERENCES = [
  COASTAL_AMERICAN,
  HERITAGE,
  GREAT_LAKES,
  SUMMIT_WEST,
  GULF_COAST,
];

export const CFB_TEAMS: CfbTeamSeed[] = [
  // Magnolia Conference (16)
  seed("Tuscaloosa", "Crimson", MAGNOLIA, "power", 96),
  seed("Auburn", "Tigers", MAGNOLIA, "power", 82),
  seed("Fayetteville", "Razorbacks", MAGNOLIA, "power", 68),
  seed("Gainesville", "Gators", MAGNOLIA, "power", 80),
  seed("Athens", "Bulldogs", MAGNOLIA, "power", 95),
  seed("Lexington", "Wildcats", MAGNOLIA, "power", 58),
  seed("Baton Rouge", "Tigers", MAGNOLIA, "power", 88),
  seed("Starkville", "Bulldogs", MAGNOLIA, "power", 60),
  seed("Mizzou", "Tigers", MAGNOLIA, "power", 70),
  seed("Oxford", "Rebels", MAGNOLIA, "power", 76),
  seed("Columbia", "Gamecocks", MAGNOLIA, "power", 65),
  seed("Knoxville", "Volunteers", MAGNOLIA, "power", 84),
  seed("College Station", "Aggies", MAGNOLIA, "power", 78),
  seed("Nashville", "Commodores", MAGNOLIA, "power", 42),
  seed("Norman", "Sooners", MAGNOLIA, "power", 86),
  seed("Austin", "Longhorns", MAGNOLIA, "power", 92),

  // Heartland Conference (18)
  seed("Champaign", "Illini", HEARTLAND, "power", 55),
  seed("Bloomington", "Hoosiers", HEARTLAND, "power", 58),
  seed("Iowa City", "Hawkeyes", HEARTLAND, "power", 66),
  seed("College Park", "Terrapins", HEARTLAND, "power", 52),
  seed("Ann Arbor", "Wolverines", HEARTLAND, "power", 93),
  seed("East Lansing", "Spartans", HEARTLAND, "power", 68),
  seed("Minneapolis", "Golden Gophers", HEARTLAND, "power", 56),
  seed("Lincoln", "Cornhuskers", HEARTLAND, "power", 62),
  seed("Evanston", "Wildcats", HEARTLAND, "power", 50),
  seed("Columbus", "Buckeyes", HEARTLAND, "power", 96),
  seed("State College", "Nittany Lions", HEARTLAND, "power", 87),
  seed("West Lafayette", "Boilermakers", HEARTLAND, "power", 48),
  seed("Piscataway", "Scarlet Knights", HEARTLAND, "power", 45),
  seed("Madison", "Badgers", HEARTLAND, "power", 72),
  seed("Westwood", "Bruins", HEARTLAND, "power", 60),
  seed("Los Angeles", "Trojans", HEARTLAND, "power", 82),
  seed("Eugene", "Ducks", HEARTLAND, "power", 85),
  seed("Seattle", "Huskies", HEARTLAND, "power", 74),

  // Seaboard Conference (17)
  seed("Chestnut Hill", "Eagles", SEABOARD, "power", 50),
  seed("Clemson", "Tigers", SEABOARD, "power", 90),
  seed("Durham", "Blue Devils", SEABOARD, "power", 44),
  seed("Tallahassee", "Seminoles", SEABOARD, "power", 84),
  seed("Atlanta", "Yellow Jackets", SEABOARD, "power", 58),
  seed("Louisville", "Cardinals", SEABOARD, "power", 66),
  seed("Coral Gables", "Hurricanes", SEABOARD, "power", 80),
  seed("Raleigh", "Wolfpack", SEABOARD, "power", 57),
  seed("Chapel Hill", "Tar Heels", SEABOARD, "power", 64),
  seed("Pittsburgh", "Panthers", SEABOARD, "power", 61),
  seed("Syracuse", "Orange", SEABOARD, "power", 52),
  seed("Charlottesville", "Cavaliers", SEABOARD, "power", 47),
  seed("Blacksburg", "Hokies", SEABOARD, "power", 63),
  seed("Winston-Salem", "Demon Deacons", SEABOARD, "power", 46),
  seed("Berkeley", "Golden Bears", SEABOARD, "power", 55),
  seed("Dallas", "Mustangs", SEABOARD, "power", 59),
  seed("Palo Alto", "Redwoods", SEABOARD, "power", 54),

  // Frontier Conference (16)
  seed("Waco", "Bears", FRONTIER, "power", 67),
  seed("Provo", "Cougars", FRONTIER, "power", 70),
  seed("Cincinnati", "Bearcats", FRONTIER, "power", 62),
  seed("Houston", "Cougars", FRONTIER, "power", 60),
  seed("Ames", "Cyclones", FRONTIER, "power", 61),
  seed("Lawrence", "Jayhawks", FRONTIER, "power", 50),
  seed("Manhattan", "Wildcats", FRONTIER, "power", 63),
  seed("Stillwater", "Cowboys", FRONTIER, "power", 65),
  seed("Fort Worth", "Horned Frogs", FRONTIER, "power", 69),
  seed("Lubbock", "Red Raiders", FRONTIER, "power", 64),
  seed("Orlando", "Knights", FRONTIER, "power", 66),
  seed("Morgantown", "Mountaineers", FRONTIER, "power", 58),
  seed("Tucson", "Wildcats", FRONTIER, "power", 56),
  seed("Tempe", "Sun Devils", FRONTIER, "power", 55),
  seed("Boulder", "Buffaloes", FRONTIER, "power", 68),
  seed("Salt Lake City", "Utes", FRONTIER, "power", 72),

  // Coastal American Conference (14)
  seed("West Point", "Black Knights", COASTAL_AMERICAN, "group5", 55),
  seed("Charlotte", "49ers", COASTAL_AMERICAN, "group5", 44),
  seed("Greenville", "Pirates", COASTAL_AMERICAN, "group5", 48),
  seed("Boca Raton", "Owls", COASTAL_AMERICAN, "group5", 50),
  seed("Memphis", "Tigers", COASTAL_AMERICAN, "group5", 62),
  seed("Annapolis", "Midshipmen", COASTAL_AMERICAN, "group5", 54),
  seed("Denton", "Mean Green", COASTAL_AMERICAN, "group5", 47),
  seed("West University", "Owls", COASTAL_AMERICAN, "group5", 45),
  seed("Tampa", "Bulls", COASTAL_AMERICAN, "group5", 52),
  seed("Philadelphia", "Owls", COASTAL_AMERICAN, "group5", 46),
  seed("New Orleans", "Green Wave", COASTAL_AMERICAN, "group5", 60),
  seed("Tulsa", "Golden Hurricane", COASTAL_AMERICAN, "group5", 43),
  seed("Birmingham", "Blazers", COASTAL_AMERICAN, "group5", 49),
  seed("San Antonio", "Roadrunners", COASTAL_AMERICAN, "group5", 51),

  // Heritage Conference (11)
  seed("Newark", "Blue Hens", HERITAGE, "group5", 42),
  seed("Jacksonville", "Gamecocks", HERITAGE, "group5", 44),
  seed("Kennesaw", "Owls", HERITAGE, "group5", 40),
  seed("Lynchburg", "Flames", HERITAGE, "group5", 58),
  seed("Ruston", "Bulldogs", HERITAGE, "group5", 43),
  seed("Murfreesboro", "Blue Raiders", HERITAGE, "group5", 45),
  seed("Springfield", "Bears", HERITAGE, "group5", 39),
  seed("Las Cruces", "Aggies", HERITAGE, "group5", 41),
  seed("Huntsville", "Bearkats", HERITAGE, "group5", 40),
  seed("El Paso", "Miners", HERITAGE, "group5", 38),
  seed("Warren Hills", "Hilltoppers", HERITAGE, "group5", 46),

  // Great Lakes Conference (12)
  seed("Akron", "Zips", GREAT_LAKES, "group5", 38),
  seed("Muncie", "Cardinals", GREAT_LAKES, "group5", 41),
  seed("Bowling Green", "Falcons", GREAT_LAKES, "group5", 43),
  seed("Buffalo", "Bulls", GREAT_LAKES, "group5", 47),
  seed("Mount Pleasant", "Chippewas", GREAT_LAKES, "group5", 45),
  seed("Ypsilanti", "Eagles", GREAT_LAKES, "group5", 40),
  seed("Kent", "Golden Flashes", GREAT_LAKES, "group5", 39),
  seed("Oxford Heights", "RedHawks", GREAT_LAKES, "group5", 42),
  seed("DeKalb", "Huskies", GREAT_LAKES, "group5", 46),
  seed("Hocking Valley", "Bobcats", GREAT_LAKES, "group5", 48),
  seed("Toledo", "Rockets", GREAT_LAKES, "group5", 49),
  seed("Kalamazoo", "Broncos", GREAT_LAKES, "group5", 44),

  // Summit West Conference (12)
  seed("Colorado Springs", "Falcons", SUMMIT_WEST, "group5", 50),
  seed("Boise", "Broncos", SUMMIT_WEST, "group5", 63),
  seed("Fort Collins", "Rams", SUMMIT_WEST, "group5", 46),
  seed("Fresno", "Bulldogs", SUMMIT_WEST, "group5", 52),
  seed("Honolulu", "Rainbow Warriors", SUMMIT_WEST, "group5", 45),
  seed("Reno", "Wolf Pack", SUMMIT_WEST, "group5", 44),
  seed("Albuquerque", "Lobos", SUMMIT_WEST, "group5", 40),
  seed("San Diego", "Aztecs", SUMMIT_WEST, "group5", 55),
  seed("San Jose", "Spartans", SUMMIT_WEST, "group5", 39),
  seed("Las Vegas", "Rebels", SUMMIT_WEST, "group5", 43),
  seed("Logan", "Aggies", SUMMIT_WEST, "group5", 47),
  seed("Laramie", "Cowboys", SUMMIT_WEST, "group5", 41),

  // Gulf Coast Conference (14)
  seed("Boone", "Mountaineers", GULF_COAST, "group5", 56),
  seed("Jonesboro", "Red Wolves", GULF_COAST, "group5", 44),
  seed("Conway", "Chanticleers", GULF_COAST, "group5", 50),
  seed("Statesboro", "Eagles", GULF_COAST, "group5", 48),
  seed("Peachtree", "Panthers", GULF_COAST, "group5", 45),
  seed("Harrisonburg", "Dukes", GULF_COAST, "group5", 58),
  seed("Lafayette", "Cajuns", GULF_COAST, "group5", 53),
  seed("Monroe", "Warhawks", GULF_COAST, "group5", 38),
  seed("Huntington", "Herd", GULF_COAST, "group5", 46),
  seed("Norfolk", "Monarchs", GULF_COAST, "group5", 42),
  seed("Mobile", "Jaguars", GULF_COAST, "group5", 40),
  seed("Hattiesburg", "Golden Eagles", GULF_COAST, "group5", 47),
  seed("San Marcos", "Bobcats", GULF_COAST, "group5", 43),
  seed("Troy", "Trojans", GULF_COAST, "group5", 49),

  // Independents (3)
  seed("South Bend", "Irish", INDEPENDENTS, "independent", 89),
  seed("Storrs", "Huskies", INDEPENDENTS, "independent", 45),
  seed("Amherst", "Minutemen", INDEPENDENTS, "independent", 38),
];
