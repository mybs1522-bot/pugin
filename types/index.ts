export type RoomType =
  | "Living Room"
  | "Bedroom"
  | "Bathroom"
  | "Kitchen"
  | "Dining Room"
  | "Home Office"
  | "Kids Room"
  | "House"
  | "Villa"
  | "Apartment Building"
  | "Office Building"
  | "Commercial Facade"
  | "Garden / Landscape"
  | "Entrance / Driveway";

export type DesignTheme =
  | "Modern"
  | "Minimalist"
  | "Scandinavian"
  | "Industrial"
  | "Bohemian"
  | "Traditional"
  | "Coastal"
  | "Mid-Century Modern";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface DesignQuestionnaire {
  spaceType: "interior" | "exterior";
  roomType: RoomType;
  roomSize: "small" | "medium" | "large" | "open-plan";
  ceilingHeight: "low" | "standard" | "high" | "vaulted";
  naturalLight: "minimal" | "moderate" | "abundant";
  primaryStyle?: DesignTheme | "auto";
  mood: "cozy" | "airy" | "dramatic" | "serene" | "energetic" | "luxurious";
  era:
    | "contemporary"
    | "mid-century"
    | "vintage"
    | "traditional"
    | "futuristic";
  colorPalette:
    | "warm-neutrals"
    | "cool-neutrals"
    | "bold"
    | "monochrome"
    | "earthy"
    | "pastel";
  wallFinish:
    | "white"
    | "cream"
    | "light-gray"
    | "beige"
    | "dark"
    | "textured"
    | "wood-paneled";
  floorMaterial:
    | "light-hardwood"
    | "dark-hardwood"
    | "marble"
    | "concrete"
    | "carpet"
    | "tile"
    | "herringbone";
  furnitureDensity: "minimal" | "moderate" | "fully-furnished";
  woodTone:
    | "light-ash"
    | "medium-oak"
    | "dark-walnut"
    | "painted-white"
    | "none";
  metalAccent:
    | "brushed-gold"
    | "polished-silver"
    | "matte-black"
    | "aged-bronze"
    | "none";
  textileRichness: "minimal" | "layered" | "rich-and-textured";
  lightingMood:
    | "bright-natural"
    | "warm-ambient"
    | "dramatic-spotlit"
    | "soft-diffused";
  greenery: "none" | "minimal" | "moderate" | "lush-botanical";
  specialElements?: string[];
  accentColor?: string;
  customColors?: Record<string, string>;
  userCustomized?: boolean;
}
