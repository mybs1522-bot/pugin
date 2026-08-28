// Comprehensive PBR Material Library for Architecture & 3D Visualization
export interface PbrTexture {
  id: string;
  name: string;
  thumb: string;
}

export interface PbrCategory {
  id: string;
  label: string;
  icon: string;
  textures: PbrTexture[];
}

export interface ArchitecturalSurfaceTarget {
  id: string;
  label: string;
  icon: string;
  defaultCategory: string;
  defaultTexture: string;
}

// ----------------------------------------------------
// INTERIOR SURFACES & MATERIAL CATEGORIES
// ----------------------------------------------------
export const INTERIOR_SURFACES: ArchitecturalSurfaceTarget[] = [
  {
    id: "wall",
    label: "Walls",
    icon: "🧱",
    defaultCategory: "concretes",
    defaultTexture: "beige_wall_001",
  },
  {
    id: "floor",
    label: "Flooring",
    icon: "🪵",
    defaultCategory: "woods",
    defaultTexture: "american_walnut_veneer",
  },
  {
    id: "cabinetry",
    label: "Cabinetry",
    icon: "🪑",
    defaultCategory: "woods",
    defaultTexture: "ash_veneer",
  },
  {
    id: "countertop",
    label: "Countertops",
    icon: "🪨",
    defaultCategory: "marbles",
    defaultTexture: "calacatta_gold",
  },
  {
    id: "fabric",
    label: "Fabrics",
    icon: "🛋️",
    defaultCategory: "fabrics",
    defaultTexture: "brown_leather",
  },
  {
    id: "fixtures",
    label: "Fixtures",
    icon: "⚙️",
    defaultCategory: "metals",
    defaultTexture: "metal_plate_02",
  },
  {
    id: "ceiling",
    label: "Ceiling",
    icon: "🏛️",
    defaultCategory: "concretes",
    defaultTexture: "beige_wall_002",
  },
];

export const INTERIOR_PBR_CATEGORIES: PbrCategory[] = [
  {
    id: "woods",
    label: "Wood & Veneers",
    icon: "🪵",
    textures: [
      {
        id: "aerial_wood_snips",
        name: "Aerial Wood Snips",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_wood_snips.png?width=256&height=256",
      },
      {
        id: "american_walnut_veneer",
        name: "American Walnut Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/american_walnut_veneer.png?width=256&height=256",
      },
      {
        id: "angli_veneer",
        name: "Angli Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/angli_veneer.png?width=256&height=256",
      },
      {
        id: "ash_veneer",
        name: "Ash Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/ash_veneer.png?width=256&height=256",
      },
      {
        id: "bamboo_veneer",
        name: "Bamboo Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_veneer.png?width=256&height=256",
      },
      {
        id: "bamboo_wall",
        name: "Bamboo Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_02",
        name: "Bamboo Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_02.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_03",
        name: "Bamboo Wall 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_03.png?width=256&height=256",
      },
      {
        id: "bark_bluegum",
        name: "Bark Blue gum",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_bluegum.png?width=256&height=256",
      },
      {
        id: "bark_brown_01",
        name: "Bark Brown 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_brown_01.png?width=256&height=256",
      },
      {
        id: "bark_brown_02",
        name: "Bark Brown 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_brown_02.png?width=256&height=256",
      },
      {
        id: "bark_platanus",
        name: "Bark Platanus",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_platanus.png?width=256&height=256",
      },
      {
        id: "bark_willow",
        name: "Bark Willow",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_willow.png?width=256&height=256",
      },
      {
        id: "bark_willow_02",
        name: "Bark Willow 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_willow_02.png?width=256&height=256",
      },
      {
        id: "beam_wall_01",
        name: "Beam Wall 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beam_wall_01.png?width=256&height=256",
      },
      {
        id: "black_oak_veneer",
        name: "Black Oak Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_oak_veneer.png?width=256&height=256",
      },
      {
        id: "black_painted_planks",
        name: "Black Painted Planks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_painted_planks.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_01",
        name: "Black Walnut Veneer 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_01.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_02",
        name: "Black Walnut Veneer 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_02.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_03",
        name: "Black Walnut Veneer 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_03.png?width=256&height=256",
      },
      {
        id: "blue_painted_planks",
        name: "Blue Painted Planks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_painted_planks.png?width=256&height=256",
      },
      {
        id: "brown_planks_03",
        name: "Brown Planks 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_03.png?width=256&height=256",
      },
      {
        id: "brown_planks_04",
        name: "Brown Planks 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_04.png?width=256&height=256",
      },
      {
        id: "brown_planks_05",
        name: "Brown Planks 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_05.png?width=256&height=256",
      },
      {
        id: "brown_planks_07",
        name: "Brown Planks 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_07.png?width=256&height=256",
      },
      {
        id: "brown_planks_08",
        name: "Brown Planks 08",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_08.png?width=256&height=256",
      },
      {
        id: "brown_planks_09",
        name: "Brown Planks 09",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_09.png?width=256&height=256",
      },
      {
        id: "cherry_veneer",
        name: "Cherry Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cherry_veneer.png?width=256&height=256",
      },
      {
        id: "chinese_cedar_bark",
        name: "Chinese Cedar Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/chinese_cedar_bark.png?width=256&height=256",
      },
      {
        id: "chinese_hackberry_bark",
        name: "Chinese Hackberry Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/chinese_hackberry_bark.png?width=256&height=256",
      },
    ],
  },
  {
    id: "marbles",
    label: "Marble & Stones",
    icon: "🏛️",
    textures: [
      {
        id: "aerial_grass_rock",
        name: "Aerial Grass Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_grass_rock.png?width=256&height=256",
      },
      {
        id: "aerial_ground_rock",
        name: "Aerial Ground Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_ground_rock.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_01",
        name: "Aerial Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_01.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_02",
        name: "Aerial Rocks 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_02.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_04",
        name: "Aerial Rocks 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_04.png?width=256&height=256",
      },
      {
        id: "bicolour_gravel",
        name: "Bicolour Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bicolour_gravel.png?width=256&height=256",
      },
      {
        id: "brick_floor_003",
        name: "Brick Floor 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_003.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "broken_wall",
        name: "Broken Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/broken_wall.png?width=256&height=256",
      },
      {
        id: "brown_mud",
        name: "Brown Mud",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud.png?width=256&height=256",
      },
      {
        id: "brown_mud_02",
        name: "Brown Mud 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_02.png?width=256&height=256",
      },
      {
        id: "brown_mud_03",
        name: "Brown Mud 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_03.png?width=256&height=256",
      },
      {
        id: "brown_mud_dry",
        name: "Brown Mud Dry",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_dry.png?width=256&height=256",
      },
      {
        id: "brown_mud_leaves_01",
        name: "Brown Mud Leaves 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_leaves_01.png?width=256&height=256",
      },
      {
        id: "brown_mud_rocks_01",
        name: "Brown Mud Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_rocks_01.png?width=256&height=256",
      },
      {
        id: "burned_ground_01",
        name: "Burned Ground 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/burned_ground_01.png?width=256&height=256",
      },
      {
        id: "castle_wall_varriation",
        name: "Castle Wall Variation",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/castle_wall_varriation.png?width=256&height=256",
      },
      {
        id: "clean_pebbles",
        name: "Clean Pebbles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clean_pebbles.png?width=256&height=256",
      },
      {
        id: "cliff_side",
        name: "Cliff Side",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cliff_side.png?width=256&height=256",
      },
      {
        id: "climbing_wall",
        name: "Climbing Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall.png?width=256&height=256",
      },
      {
        id: "climbing_wall_02",
        name: "Climbing Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_02.png?width=256&height=256",
      },
      {
        id: "climbing_wall_base",
        name: "Climbing Wall Base",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_base.png?width=256&height=256",
      },
      {
        id: "coast_land_rocks_01",
        name: "Coast Land Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_land_rocks_01.png?width=256&height=256",
      },
      {
        id: "coast_sand_01",
        name: "Coast Sand 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_01.png?width=256&height=256",
      },
      {
        id: "coast_sand_02",
        name: "Coast Sand 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_02.png?width=256&height=256",
      },
      {
        id: "coast_sand_03",
        name: "Coast Sand 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_03.png?width=256&height=256",
      },
      {
        id: "coast_sand_04",
        name: "Coast Sand 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_04.png?width=256&height=256",
      },
      {
        id: "coast_sand_05",
        name: "Coast Sand 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_05.png?width=256&height=256",
      },
      {
        id: "coast_sand_rocks_02",
        name: "Coast Sand Rocks 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_rocks_02.png?width=256&height=256",
      },
    ],
  },
  {
    id: "concretes",
    label: "Plaster & Concrete",
    icon: "🧱",
    textures: [
      {
        id: "anti_slip_concrete",
        name: "Anti Slip Concrete",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/anti_slip_concrete.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet",
        name: "Asbestos Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet_02",
        name: "Asbestos Sheet 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet_02.png?width=256&height=256",
      },
      {
        id: "beige_wall_001",
        name: "Beige Wall 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beige_wall_001.png?width=256&height=256",
      },
      {
        id: "beige_wall_002",
        name: "Beige Wall 002",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beige_wall_002.png?width=256&height=256",
      },
      {
        id: "blue_plaster_wall",
        name: "Blue Plaster Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_plaster_wall.png?width=256&height=256",
      },
      {
        id: "blue_plaster_weathered",
        name: "Blue Plaster Weathered",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_plaster_weathered.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_wall_005",
        name: "Brick Wall 005",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_005.png?width=256&height=256",
      },
      {
        id: "brick_wall_006",
        name: "Brick Wall 006",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_006.png?width=256&height=256",
      },
      {
        id: "brick_wall_02",
        name: "Brick Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_02.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "brushed_concrete",
        name: "Brushed Concrete ",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete.png?width=256&height=256",
      },
      {
        id: "brushed_concrete_03",
        name: "Brushed Concrete 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete_03.png?width=256&height=256",
      },
      {
        id: "brushed_concrete_04",
        name: "Brushed Concrete 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete_04.png?width=256&height=256",
      },
      {
        id: "brushed_concrete_2",
        name: "Brushed Concrete 2",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete_2.png?width=256&height=256",
      },
      {
        id: "ceiling_interior",
        name: "Ceiling Interior",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/ceiling_interior.png?width=256&height=256",
      },
      {
        id: "checkered_pavement_tiles",
        name: "Checkered Pavement Tiles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/checkered_pavement_tiles.png?width=256&height=256",
      },
      {
        id: "chipped_concrete",
        name: "Chipped Concrete",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/chipped_concrete.png?width=256&height=256",
      },
      {
        id: "clay_floor_001",
        name: "Clay Floor 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clay_floor_001.png?width=256&height=256",
      },
      {
        id: "clay_plaster",
        name: "Clay Plaster",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clay_plaster.png?width=256&height=256",
      },
      {
        id: "climbing_wall",
        name: "Climbing Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall.png?width=256&height=256",
      },
      {
        id: "climbing_wall_02",
        name: "Climbing Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_02.png?width=256&height=256",
      },
      {
        id: "climbing_wall_base",
        name: "Climbing Wall Base",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_base.png?width=256&height=256",
      },
      {
        id: "cobblestone_03",
        name: "Cobblestone 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cobblestone_03.png?width=256&height=256",
      },
      {
        id: "cobblestone_04",
        name: "Cobblestone 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cobblestone_04.png?width=256&height=256",
      },
      {
        id: "cobblestone_floor_02",
        name: "Cobblestone Floor 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cobblestone_floor_02.png?width=256&height=256",
      },
      {
        id: "cobblestone_floor_03",
        name: "Cobblestone Floor 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cobblestone_floor_03.png?width=256&height=256",
      },
      {
        id: "concrete",
        name: "Concrete",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/concrete.png?width=256&height=256",
      },
      {
        id: "concrete_block_wall",
        name: "Concrete Block Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/concrete_block_wall.png?width=256&height=256",
      },
    ],
  },
  {
    id: "tiles",
    label: "Tiles & Terrazzo",
    icon: "🔲",
    textures: [
      {
        id: "anti_skid_tiles",
        name: "Anti Skid Tiles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/anti_skid_tiles.png?width=256&height=256",
      },
      {
        id: "bi_stretch",
        name: "Bi Stretch",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bi_stretch.png?width=256&height=256",
      },
      {
        id: "blue_floor_tiles_01",
        name: "Blue Floor Tiles 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_floor_tiles_01.png?width=256&height=256",
      },
      {
        id: "book_pattern",
        name: "Book Pattern",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/book_pattern.png?width=256&height=256",
      },
      {
        id: "brick_4",
        name: "Brick 4",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_4.png?width=256&height=256",
      },
      {
        id: "brick_crosswalk",
        name: "Brick Crosswalk",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_crosswalk.png?width=256&height=256",
      },
      {
        id: "brick_floor",
        name: "Brick Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor.png?width=256&height=256",
      },
      {
        id: "brick_floor_02",
        name: "Brick Floor 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_02.png?width=256&height=256",
      },
      {
        id: "brick_floor_04",
        name: "Brick Floor 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_04.png?width=256&height=256",
      },
      {
        id: "brick_gravel",
        name: "Brick Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_gravel.png?width=256&height=256",
      },
      {
        id: "brick_moss_001",
        name: "Brick Moss 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_moss_001.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_pavement_02",
        name: "Brick Pavement 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement_02.png?width=256&height=256",
      },
      {
        id: "brick_pavement_03",
        name: "Brick Pavement 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement_03.png?width=256&height=256",
      },
      {
        id: "brick_villa_floor",
        name: "Brick Villa Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_villa_floor.png?width=256&height=256",
      },
      {
        id: "brick_wall_001",
        name: "Brick Wall 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_001.png?width=256&height=256",
      },
      {
        id: "brick_wall_003",
        name: "Brick Wall 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_003.png?width=256&height=256",
      },
      {
        id: "brick_wall_005",
        name: "Brick Wall 005",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_005.png?width=256&height=256",
      },
      {
        id: "brick_wall_006",
        name: "Brick Wall 006",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_006.png?width=256&height=256",
      },
      {
        id: "brick_wall_02",
        name: "Brick Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_02.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "brick_wall_07",
        name: "Brick Wall 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_07.png?width=256&height=256",
      },
      {
        id: "brick_wall_08",
        name: "Brick Wall 08",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_08.png?width=256&height=256",
      },
      {
        id: "brick_wall_09",
        name: "Brick Wall 09",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_09.png?width=256&height=256",
      },
      {
        id: "brick_wall_10",
        name: "Brick Wall 10",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_10.png?width=256&height=256",
      },
      {
        id: "brick_wall_11",
        name: "Brick Wall 11",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_11.png?width=256&height=256",
      },
      {
        id: "brick_wall_12",
        name: "Brick Wall 12",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_12.png?width=256&height=256",
      },
      {
        id: "brick_wall_13",
        name: "Brick Wall 13",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_13.png?width=256&height=256",
      },
      {
        id: "broken_brick_wall",
        name: "Broken Brick Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/broken_brick_wall.png?width=256&height=256",
      },
      {
        id: "brown_brick_02",
        name: "Brown Brick 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_brick_02.png?width=256&height=256",
      },
    ],
  },
  {
    id: "fabrics",
    label: "Fabrics & Leathers",
    icon: "🧶",
    textures: [
      {
        id: "bi_stretch",
        name: "Bi Stretch",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bi_stretch.png?width=256&height=256",
      },
      {
        id: "book_pattern",
        name: "Book Pattern",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/book_pattern.png?width=256&height=256",
      },
      {
        id: "brown_leather",
        name: "Brown Leather",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_leather.png?width=256&height=256",
      },
      {
        id: "caban",
        name: "Caban",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/caban.png?width=256&height=256",
      },
      {
        id: "cotton_jersey",
        name: "Cotton Jersey",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cotton_jersey.png?width=256&height=256",
      },
      {
        id: "crepe_georgette",
        name: "Crepe Georgette",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/crepe_georgette.png?width=256&height=256",
      },
      {
        id: "crepe_satin",
        name: "Crepe Satin",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/crepe_satin.png?width=256&height=256",
      },
      {
        id: "curly_teddy_checkered",
        name: "Curly Teddy Checkered",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/curly_teddy_checkered.png?width=256&height=256",
      },
      {
        id: "curly_teddy_natural",
        name: "Curly Teddy Natural",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/curly_teddy_natural.png?width=256&height=256",
      },
      {
        id: "denim_fabric",
        name: "Denim Fabric",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denim_fabric.png?width=256&height=256",
      },
      {
        id: "denim_fabric_03",
        name: "Denim Fabric 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denim_fabric_03.png?width=256&height=256",
      },
      {
        id: "denim_fabric_04",
        name: "Denim Fabric 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denim_fabric_04.png?width=256&height=256",
      },
      {
        id: "denim_fabric_05",
        name: "Denim Fabric 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denim_fabric_05.png?width=256&height=256",
      },
      {
        id: "denim_fabric_06",
        name: "Denim Fabric 06",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denim_fabric_06.png?width=256&height=256",
      },
      {
        id: "denmin_fabric_02",
        name: "Denim Fabric 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/denmin_fabric_02.png?width=256&height=256",
      },
      {
        id: "dirty_carpet",
        name: "Dirty Carpet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/dirty_carpet.png?width=256&height=256",
      },
      {
        id: "fabric_leather_01",
        name: "Fabric Leather 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/fabric_leather_01.png?width=256&height=256",
      },
      {
        id: "fabric_leather_02",
        name: "Fabric Leather 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/fabric_leather_02.png?width=256&height=256",
      },
      {
        id: "fabric_pattern_05",
        name: "Fabric Pattern 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/fabric_pattern_05.png?width=256&height=256",
      },
      {
        id: "fabric_pattern_07",
        name: "Fabric Pattern 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/fabric_pattern_07.png?width=256&height=256",
      },
      {
        id: "faux_fur_geometric",
        name: "Faux Fur Geometric",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/faux_fur_geometric.png?width=256&height=256",
      },
      {
        id: "floral_jacquard",
        name: "Floral Jacquard",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/floral_jacquard.png?width=256&height=256",
      },
      {
        id: "gingham_check",
        name: "Gingham Check",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/gingham_check.png?width=256&height=256",
      },
      {
        id: "hessian_230",
        name: "Hessian 230",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/hessian_230.png?width=256&height=256",
      },
      {
        id: "hessian_380",
        name: "Hessian 380",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/hessian_380.png?width=256&height=256",
      },
      {
        id: "jersey_melange",
        name: "Jersey Melange",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/jersey_melange.png?width=256&height=256",
      },
      {
        id: "jogging_melange",
        name: "Jogging Melange",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/jogging_melange.png?width=256&height=256",
      },
      {
        id: "knitted_fleece",
        name: "Knitted Fleece",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/knitted_fleece.png?width=256&height=256",
      },
      {
        id: "leather_red_02",
        name: "Leather Red 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/leather_red_02.png?width=256&height=256",
      },
      {
        id: "leather_red_03",
        name: "Leather Red 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/leather_red_03.png?width=256&height=256",
      },
    ],
  },
  {
    id: "metals",
    label: "Metals & Finishes",
    icon: "⚙️",
    textures: [
      {
        id: "bark_bluegum",
        name: "Bark Blue gum",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_bluegum.png?width=256&height=256",
      },
      {
        id: "blue_metal_plate",
        name: "Blue Metal Plate",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_metal_plate.png?width=256&height=256",
      },
      {
        id: "box_profile_metal_sheet",
        name: "Box Profile Metal Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/box_profile_metal_sheet.png?width=256&height=256",
      },
      {
        id: "container_side",
        name: "Container Side",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/container_side.png?width=256&height=256",
      },
      {
        id: "corrugated_iron",
        name: "Corrugated Iron",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron.png?width=256&height=256",
      },
      {
        id: "corrugated_iron_02",
        name: "Corrugated Iron 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron_02.png?width=256&height=256",
      },
      {
        id: "corrugated_iron_03",
        name: "Corrugated Iron 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron_03.png?width=256&height=256",
      },
      {
        id: "distressed_painted_planks",
        name: "Distressed Painted Planks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/distressed_painted_planks.png?width=256&height=256",
      },
      {
        id: "factory_wall",
        name: "Factory Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/factory_wall.png?width=256&height=256",
      },
      {
        id: "green_metal_rust",
        name: "Green Metal Rust",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/green_metal_rust.png?width=256&height=256",
      },
      {
        id: "hessian_230",
        name: "Hessian 230",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/hessian_230.png?width=256&height=256",
      },
      {
        id: "hessian_380",
        name: "Hessian 380",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/hessian_380.png?width=256&height=256",
      },
      {
        id: "japanese_camphor_bark",
        name: "Japanese Camphor Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/japanese_camphor_bark.png?width=256&height=256",
      },
      {
        id: "japanese_zelkova_bark",
        name: "Japanese Zelkova Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/japanese_zelkova_bark.png?width=256&height=256",
      },
      {
        id: "knotted_pine_bark",
        name: "Knotted Pine Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/knotted_pine_bark.png?width=256&height=256",
      },
      {
        id: "metal_grate_rusty",
        name: "Metal Grate Rusty",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_grate_rusty.png?width=256&height=256",
      },
      {
        id: "metal_plate",
        name: "Metal Plate",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_plate.png?width=256&height=256",
      },
      {
        id: "metal_plate_02",
        name: "Metal Plate 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_plate_02.png?width=256&height=256",
      },
      {
        id: "painted_brick",
        name: "Painted Brick",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/painted_brick.png?width=256&height=256",
      },
      {
        id: "painted_metal_shutter",
        name: "Painted Metal Shutter",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/painted_metal_shutter.png?width=256&height=256",
      },
      {
        id: "palm_bark",
        name: "Palm Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/palm_bark.png?width=256&height=256",
      },
      {
        id: "roof_07",
        name: "Roof 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/roof_07.png?width=256&height=256",
      },
      {
        id: "rough_pine_door",
        name: "Rough Pine Door",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rough_pine_door.png?width=256&height=256",
      },
      {
        id: "rust_coarse_01",
        name: "Rust Coarse 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rust_coarse_01.png?width=256&height=256",
      },
      {
        id: "rusted_shutter",
        name: "Rusted Shutter",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rusted_shutter.png?width=256&height=256",
      },
      {
        id: "rustic_stone_wall_02",
        name: "Rustic Stone Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rustic_stone_wall_02.png?width=256&height=256",
      },
      {
        id: "rusty_corrugated_iron",
        name: "Rusty Corrugated Iron",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rusty_corrugated_iron.png?width=256&height=256",
      },
      {
        id: "rusty_metal",
        name: "Rusty Metal",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rusty_metal.png?width=256&height=256",
      },
      {
        id: "rusty_metal_02",
        name: "Rusty Metal 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rusty_metal_02.png?width=256&height=256",
      },
      {
        id: "rusty_metal_03",
        name: "Rusty Metal 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/rusty_metal_03.png?width=256&height=256",
      },
    ],
  },
];

// ----------------------------------------------------
// EXTERIOR SURFACES & MATERIAL CATEGORIES
// ----------------------------------------------------
export const EXTERIOR_SURFACES: ArchitecturalSurfaceTarget[] = [
  {
    id: "facade",
    label: "Main Facade",
    icon: "🏢",
    defaultCategory: "facades",
    defaultTexture: "beige_wall_001",
  },
  {
    id: "masonry",
    label: "Stone & Masonry",
    icon: "🧱",
    defaultCategory: "masonry",
    defaultTexture: "aerial_rocks_02",
  },
  {
    id: "roofing",
    label: "Roof & Eaves",
    icon: "🏠",
    defaultCategory: "roofing",
    defaultTexture: "corrugated_iron",
  },
  {
    id: "pavement",
    label: "Driveway & Pavers",
    icon: "🛣️",
    defaultCategory: "pavers",
    defaultTexture: "brick_pavement",
  },
  {
    id: "landscape",
    label: "Terrain & Lawn",
    icon: "🌿",
    defaultCategory: "landscape",
    defaultTexture: "aerial_grass_rock",
  },
  {
    id: "decking",
    label: "Decking & Pergola",
    icon: "🪵",
    defaultCategory: "decking",
    defaultTexture: "black_painted_planks",
  },
  {
    id: "framing",
    label: "Framing & Mullions",
    icon: "⚙️",
    defaultCategory: "roofing",
    defaultTexture: "blue_metal_plate",
  },
];

export const EXTERIOR_PBR_CATEGORIES: PbrCategory[] = [
  {
    id: "facades",
    label: "Facade & Stucco",
    icon: "🏢",
    textures: [
      {
        id: "anti_slip_concrete",
        name: "Anti Slip Concrete",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/anti_slip_concrete.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet",
        name: "Asbestos Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet_02",
        name: "Asbestos Sheet 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet_02.png?width=256&height=256",
      },
      {
        id: "bamboo_wall",
        name: "Bamboo Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_02",
        name: "Bamboo Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_02.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_03",
        name: "Bamboo Wall 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_03.png?width=256&height=256",
      },
      {
        id: "beam_wall_01",
        name: "Beam Wall 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beam_wall_01.png?width=256&height=256",
      },
      {
        id: "beige_wall_001",
        name: "Beige Wall 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beige_wall_001.png?width=256&height=256",
      },
      {
        id: "beige_wall_002",
        name: "Beige Wall 002",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beige_wall_002.png?width=256&height=256",
      },
      {
        id: "blue_metal_plate",
        name: "Blue Metal Plate",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_metal_plate.png?width=256&height=256",
      },
      {
        id: "blue_plaster_wall",
        name: "Blue Plaster Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_plaster_wall.png?width=256&height=256",
      },
      {
        id: "blue_plaster_weathered",
        name: "Blue Plaster Weathered",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_plaster_weathered.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_pavement_03",
        name: "Brick Pavement 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement_03.png?width=256&height=256",
      },
      {
        id: "brick_wall_003",
        name: "Brick Wall 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_003.png?width=256&height=256",
      },
      {
        id: "brick_wall_005",
        name: "Brick Wall 005",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_005.png?width=256&height=256",
      },
      {
        id: "brick_wall_006",
        name: "Brick Wall 006",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_006.png?width=256&height=256",
      },
      {
        id: "brick_wall_02",
        name: "Brick Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_02.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "brick_wall_07",
        name: "Brick Wall 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_07.png?width=256&height=256",
      },
      {
        id: "brick_wall_09",
        name: "Brick Wall 09",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_09.png?width=256&height=256",
      },
      {
        id: "brick_wall_10",
        name: "Brick Wall 10",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_10.png?width=256&height=256",
      },
      {
        id: "brick_wall_11",
        name: "Brick Wall 11",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_11.png?width=256&height=256",
      },
      {
        id: "brick_wall_12",
        name: "Brick Wall 12",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_12.png?width=256&height=256",
      },
      {
        id: "brick_wall_13",
        name: "Brick Wall 13",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_13.png?width=256&height=256",
      },
      {
        id: "broken_brick_wall",
        name: "Broken Brick Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/broken_brick_wall.png?width=256&height=256",
      },
      {
        id: "broken_wall",
        name: "Broken Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/broken_wall.png?width=256&height=256",
      },
      {
        id: "brushed_concrete",
        name: "Brushed Concrete ",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete.png?width=256&height=256",
      },
      {
        id: "brushed_concrete_03",
        name: "Brushed Concrete 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete_03.png?width=256&height=256",
      },
      {
        id: "brushed_concrete_04",
        name: "Brushed Concrete 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brushed_concrete_04.png?width=256&height=256",
      },
    ],
  },
  {
    id: "masonry",
    label: "Stone & Masonry",
    icon: "🧱",
    textures: [
      {
        id: "aerial_grass_rock",
        name: "Aerial Grass Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_grass_rock.png?width=256&height=256",
      },
      {
        id: "aerial_ground_rock",
        name: "Aerial Ground Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_ground_rock.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_01",
        name: "Aerial Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_01.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_02",
        name: "Aerial Rocks 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_02.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_04",
        name: "Aerial Rocks 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_04.png?width=256&height=256",
      },
      {
        id: "bicolour_gravel",
        name: "Bicolour Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bicolour_gravel.png?width=256&height=256",
      },
      {
        id: "brick_floor_003",
        name: "Brick Floor 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_003.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "brick_wall_12",
        name: "Brick Wall 12",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_12.png?width=256&height=256",
      },
      {
        id: "broken_wall",
        name: "Broken Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/broken_wall.png?width=256&height=256",
      },
      {
        id: "brown_mud",
        name: "Brown Mud",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud.png?width=256&height=256",
      },
      {
        id: "brown_mud_02",
        name: "Brown Mud 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_02.png?width=256&height=256",
      },
      {
        id: "brown_mud_03",
        name: "Brown Mud 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_03.png?width=256&height=256",
      },
      {
        id: "brown_mud_dry",
        name: "Brown Mud Dry",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_dry.png?width=256&height=256",
      },
      {
        id: "brown_mud_leaves_01",
        name: "Brown Mud Leaves 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_leaves_01.png?width=256&height=256",
      },
      {
        id: "brown_mud_rocks_01",
        name: "Brown Mud Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_rocks_01.png?width=256&height=256",
      },
      {
        id: "burned_ground_01",
        name: "Burned Ground 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/burned_ground_01.png?width=256&height=256",
      },
      {
        id: "castle_wall_varriation",
        name: "Castle Wall Variation",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/castle_wall_varriation.png?width=256&height=256",
      },
      {
        id: "clean_pebbles",
        name: "Clean Pebbles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clean_pebbles.png?width=256&height=256",
      },
      {
        id: "cliff_side",
        name: "Cliff Side",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cliff_side.png?width=256&height=256",
      },
      {
        id: "climbing_wall",
        name: "Climbing Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall.png?width=256&height=256",
      },
      {
        id: "climbing_wall_02",
        name: "Climbing Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_02.png?width=256&height=256",
      },
      {
        id: "climbing_wall_base",
        name: "Climbing Wall Base",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/climbing_wall_base.png?width=256&height=256",
      },
      {
        id: "coast_land_rocks_01",
        name: "Coast Land Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_land_rocks_01.png?width=256&height=256",
      },
      {
        id: "coast_sand_01",
        name: "Coast Sand 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_01.png?width=256&height=256",
      },
      {
        id: "coast_sand_02",
        name: "Coast Sand 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_02.png?width=256&height=256",
      },
      {
        id: "coast_sand_03",
        name: "Coast Sand 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_03.png?width=256&height=256",
      },
      {
        id: "coast_sand_04",
        name: "Coast Sand 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_04.png?width=256&height=256",
      },
      {
        id: "coast_sand_05",
        name: "Coast Sand 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coast_sand_05.png?width=256&height=256",
      },
    ],
  },
  {
    id: "pavers",
    label: "Pavers & Asphalt",
    icon: "🛣️",
    textures: [
      {
        id: "anti_slip_concrete",
        name: "Anti Slip Concrete",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/anti_slip_concrete.png?width=256&height=256",
      },
      {
        id: "asphalt_01",
        name: "Asphalt 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_01.png?width=256&height=256",
      },
      {
        id: "asphalt_02",
        name: "Asphalt 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_02.png?width=256&height=256",
      },
      {
        id: "asphalt_03",
        name: "Asphalt 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_03.png?width=256&height=256",
      },
      {
        id: "asphalt_04",
        name: "Asphalt 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_04.png?width=256&height=256",
      },
      {
        id: "asphalt_05",
        name: "Asphalt 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_05.png?width=256&height=256",
      },
      {
        id: "asphalt_06",
        name: "Asphalt 06",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_06.png?width=256&height=256",
      },
      {
        id: "asphalt_07",
        name: "Asphalt 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_07.png?width=256&height=256",
      },
      {
        id: "asphalt_floor",
        name: "Asphalt Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_floor.png?width=256&height=256",
      },
      {
        id: "asphalt_pit_lane",
        name: "Asphalt Pit Lane",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_pit_lane.png?width=256&height=256",
      },
      {
        id: "asphalt_snow",
        name: "Asphalt Snow",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_snow.png?width=256&height=256",
      },
      {
        id: "asphalt_track",
        name: "Asphalt Track",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_track.png?width=256&height=256",
      },
      {
        id: "bicolour_gravel",
        name: "Bicolour Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bicolour_gravel.png?width=256&height=256",
      },
      {
        id: "bitumen",
        name: "Bitumen",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bitumen.png?width=256&height=256",
      },
      {
        id: "blue_floor_tiles_01",
        name: "Blue Floor Tiles 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_floor_tiles_01.png?width=256&height=256",
      },
      {
        id: "brick_4",
        name: "Brick 4",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_4.png?width=256&height=256",
      },
      {
        id: "brick_crosswalk",
        name: "Brick Crosswalk",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_crosswalk.png?width=256&height=256",
      },
      {
        id: "brick_floor",
        name: "Brick Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor.png?width=256&height=256",
      },
      {
        id: "brick_floor_003",
        name: "Brick Floor 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_003.png?width=256&height=256",
      },
      {
        id: "brick_floor_02",
        name: "Brick Floor 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_02.png?width=256&height=256",
      },
      {
        id: "brick_floor_04",
        name: "Brick Floor 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_04.png?width=256&height=256",
      },
      {
        id: "brick_moss_001",
        name: "Brick Moss 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_moss_001.png?width=256&height=256",
      },
      {
        id: "brick_pavement",
        name: "Brick Pavement",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement.png?width=256&height=256",
      },
      {
        id: "brick_pavement_02",
        name: "Brick Pavement 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement_02.png?width=256&height=256",
      },
      {
        id: "brick_pavement_03",
        name: "Brick Pavement 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_pavement_03.png?width=256&height=256",
      },
      {
        id: "brick_villa_floor",
        name: "Brick Villa Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_villa_floor.png?width=256&height=256",
      },
      {
        id: "brick_wall_001",
        name: "Brick Wall 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_001.png?width=256&height=256",
      },
      {
        id: "brick_wall_003",
        name: "Brick Wall 003",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_003.png?width=256&height=256",
      },
      {
        id: "brick_wall_005",
        name: "Brick Wall 005",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_005.png?width=256&height=256",
      },
      {
        id: "brick_wall_006",
        name: "Brick Wall 006",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_006.png?width=256&height=256",
      },
    ],
  },
  {
    id: "roofing",
    label: "Roof & Cladding",
    icon: "🏠",
    textures: [
      {
        id: "asbestos_sheet",
        name: "Asbestos Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet_02",
        name: "Asbestos Sheet 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet_02.png?width=256&height=256",
      },
      {
        id: "bark_bluegum",
        name: "Bark Blue gum",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_bluegum.png?width=256&height=256",
      },
      {
        id: "bitumen",
        name: "Bitumen",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bitumen.png?width=256&height=256",
      },
      {
        id: "blue_metal_plate",
        name: "Blue Metal Plate",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_metal_plate.png?width=256&height=256",
      },
      {
        id: "box_profile_metal_sheet",
        name: "Box Profile Metal Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/box_profile_metal_sheet.png?width=256&height=256",
      },
      {
        id: "ceramic_roof_01",
        name: "Ceramic Roof 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/ceramic_roof_01.png?width=256&height=256",
      },
      {
        id: "clay_roof_tiles",
        name: "Clay Roof Tiles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clay_roof_tiles.png?width=256&height=256",
      },
      {
        id: "clay_roof_tiles_02",
        name: "Clay Roof Tiles 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clay_roof_tiles_02.png?width=256&height=256",
      },
      {
        id: "clay_roof_tiles_03",
        name: "Clay Roof Tiles 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/clay_roof_tiles_03.png?width=256&height=256",
      },
      {
        id: "concrete_wall_001",
        name: "Concrete Wall 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/concrete_wall_001.png?width=256&height=256",
      },
      {
        id: "container_side",
        name: "Container Side",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/container_side.png?width=256&height=256",
      },
      {
        id: "corrugated_iron",
        name: "Corrugated Iron",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron.png?width=256&height=256",
      },
      {
        id: "corrugated_iron_02",
        name: "Corrugated Iron 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron_02.png?width=256&height=256",
      },
      {
        id: "corrugated_iron_03",
        name: "Corrugated Iron 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/corrugated_iron_03.png?width=256&height=256",
      },
      {
        id: "factory_wall",
        name: "Factory Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/factory_wall.png?width=256&height=256",
      },
      {
        id: "green_metal_rust",
        name: "Green Metal Rust",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/green_metal_rust.png?width=256&height=256",
      },
      {
        id: "grey_cartago_02",
        name: "Grey Cartago 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/grey_cartago_02.png?width=256&height=256",
      },
      {
        id: "grey_roof_01",
        name: "Grey Roof 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/grey_roof_01.png?width=256&height=256",
      },
      {
        id: "grey_roof_tiles",
        name: "Grey Roof Tiles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/grey_roof_tiles.png?width=256&height=256",
      },
      {
        id: "grey_roof_tiles_02",
        name: "Grey Roof Tiles 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/grey_roof_tiles_02.png?width=256&height=256",
      },
      {
        id: "japanese_camphor_bark",
        name: "Japanese Camphor Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/japanese_camphor_bark.png?width=256&height=256",
      },
      {
        id: "japanese_zelkova_bark",
        name: "Japanese Zelkova Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/japanese_zelkova_bark.png?width=256&height=256",
      },
      {
        id: "knotted_pine_bark",
        name: "Knotted Pine Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/knotted_pine_bark.png?width=256&height=256",
      },
      {
        id: "large_sandstone_blocks",
        name: "Large Sandstone Blocks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/large_sandstone_blocks.png?width=256&height=256",
      },
      {
        id: "marble_tiles",
        name: "Marble Tiles",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/marble_tiles.png?width=256&height=256",
      },
      {
        id: "metal_grate_rusty",
        name: "Metal Grate Rusty",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_grate_rusty.png?width=256&height=256",
      },
      {
        id: "metal_plate",
        name: "Metal Plate",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_plate.png?width=256&height=256",
      },
      {
        id: "metal_plate_02",
        name: "Metal Plate 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/metal_plate_02.png?width=256&height=256",
      },
      {
        id: "painted_metal_shutter",
        name: "Painted Metal Shutter",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/painted_metal_shutter.png?width=256&height=256",
      },
    ],
  },
  {
    id: "landscape",
    label: "Grass & Terrain",
    icon: "🌿",
    textures: [
      {
        id: "aerial_beach_03",
        name: "Aerial Beach 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_beach_03.png?width=256&height=256",
      },
      {
        id: "aerial_grass_rock",
        name: "Aerial Grass Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_grass_rock.png?width=256&height=256",
      },
      {
        id: "aerial_ground_rock",
        name: "Aerial Ground Rock",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_ground_rock.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_01",
        name: "Aerial Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_01.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_02",
        name: "Aerial Rocks 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_02.png?width=256&height=256",
      },
      {
        id: "aerial_rocks_04",
        name: "Aerial Rocks 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_rocks_04.png?width=256&height=256",
      },
      {
        id: "aerial_sand",
        name: "Aerial Sand",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_sand.png?width=256&height=256",
      },
      {
        id: "aerial_wood_snips",
        name: "Aerial Wood Snips",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/aerial_wood_snips.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet",
        name: "Asbestos Sheet",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet.png?width=256&height=256",
      },
      {
        id: "asbestos_sheet_02",
        name: "Asbestos Sheet 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asbestos_sheet_02.png?width=256&height=256",
      },
      {
        id: "asphalt_01",
        name: "Asphalt 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_01.png?width=256&height=256",
      },
      {
        id: "asphalt_03",
        name: "Asphalt 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_03.png?width=256&height=256",
      },
      {
        id: "asphalt_06",
        name: "Asphalt 06",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_06.png?width=256&height=256",
      },
      {
        id: "asphalt_floor",
        name: "Asphalt Floor",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/asphalt_floor.png?width=256&height=256",
      },
      {
        id: "baseball_playground",
        name: "Baseball Playground",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/baseball_playground.png?width=256&height=256",
      },
      {
        id: "bicolour_gravel",
        name: "Bicolour Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bicolour_gravel.png?width=256&height=256",
      },
      {
        id: "bitumen",
        name: "Bitumen",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bitumen.png?width=256&height=256",
      },
      {
        id: "blue_floor_tiles_01",
        name: "Blue Floor Tiles 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_floor_tiles_01.png?width=256&height=256",
      },
      {
        id: "brick_4",
        name: "Brick 4",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_4.png?width=256&height=256",
      },
      {
        id: "brick_floor_04",
        name: "Brick Floor 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_floor_04.png?width=256&height=256",
      },
      {
        id: "brick_gravel",
        name: "Brick Gravel",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_gravel.png?width=256&height=256",
      },
      {
        id: "brick_moss_001",
        name: "Brick Moss 001",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_moss_001.png?width=256&height=256",
      },
      {
        id: "brick_wall_04",
        name: "Brick Wall 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brick_wall_04.png?width=256&height=256",
      },
      {
        id: "brown_brick_02",
        name: "Brown Brick 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_brick_02.png?width=256&height=256",
      },
      {
        id: "brown_mud",
        name: "Brown Mud",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud.png?width=256&height=256",
      },
      {
        id: "brown_mud_02",
        name: "Brown Mud 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_02.png?width=256&height=256",
      },
      {
        id: "brown_mud_03",
        name: "Brown Mud 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_03.png?width=256&height=256",
      },
      {
        id: "brown_mud_dry",
        name: "Brown Mud Dry",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_dry.png?width=256&height=256",
      },
      {
        id: "brown_mud_leaves_01",
        name: "Brown Mud Leaves 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_leaves_01.png?width=256&height=256",
      },
      {
        id: "brown_mud_rocks_01",
        name: "Brown Mud Rocks 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_mud_rocks_01.png?width=256&height=256",
      },
    ],
  },
  {
    id: "decking",
    label: "Exterior Timber",
    icon: "🪵",
    textures: [
      {
        id: "american_walnut_veneer",
        name: "American Walnut Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/american_walnut_veneer.png?width=256&height=256",
      },
      {
        id: "angli_veneer",
        name: "Angli Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/angli_veneer.png?width=256&height=256",
      },
      {
        id: "ash_veneer",
        name: "Ash Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/ash_veneer.png?width=256&height=256",
      },
      {
        id: "bamboo_veneer",
        name: "Bamboo Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_veneer.png?width=256&height=256",
      },
      {
        id: "bamboo_wall",
        name: "Bamboo Wall",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_02",
        name: "Bamboo Wall 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_02.png?width=256&height=256",
      },
      {
        id: "bamboo_wall_03",
        name: "Bamboo Wall 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bamboo_wall_03.png?width=256&height=256",
      },
      {
        id: "bark_bluegum",
        name: "Bark Blue gum",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_bluegum.png?width=256&height=256",
      },
      {
        id: "bark_brown_01",
        name: "Bark Brown 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_brown_01.png?width=256&height=256",
      },
      {
        id: "bark_brown_02",
        name: "Bark Brown 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_brown_02.png?width=256&height=256",
      },
      {
        id: "bark_platanus",
        name: "Bark Platanus",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_platanus.png?width=256&height=256",
      },
      {
        id: "bark_willow",
        name: "Bark Willow",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_willow.png?width=256&height=256",
      },
      {
        id: "bark_willow_02",
        name: "Bark Willow 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/bark_willow_02.png?width=256&height=256",
      },
      {
        id: "beam_wall_01",
        name: "Beam Wall 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/beam_wall_01.png?width=256&height=256",
      },
      {
        id: "black_oak_veneer",
        name: "Black Oak Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_oak_veneer.png?width=256&height=256",
      },
      {
        id: "black_painted_planks",
        name: "Black Painted Planks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_painted_planks.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_01",
        name: "Black Walnut Veneer 01",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_01.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_02",
        name: "Black Walnut Veneer 02",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_02.png?width=256&height=256",
      },
      {
        id: "black_walnut_veneer_03",
        name: "Black Walnut Veneer 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/black_walnut_veneer_03.png?width=256&height=256",
      },
      {
        id: "blue_painted_planks",
        name: "Blue Painted Planks",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/blue_painted_planks.png?width=256&height=256",
      },
      {
        id: "brown_planks_03",
        name: "Brown Planks 03",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_03.png?width=256&height=256",
      },
      {
        id: "brown_planks_04",
        name: "Brown Planks 04",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_04.png?width=256&height=256",
      },
      {
        id: "brown_planks_05",
        name: "Brown Planks 05",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_05.png?width=256&height=256",
      },
      {
        id: "brown_planks_07",
        name: "Brown Planks 07",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_07.png?width=256&height=256",
      },
      {
        id: "brown_planks_08",
        name: "Brown Planks 08",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_08.png?width=256&height=256",
      },
      {
        id: "brown_planks_09",
        name: "Brown Planks 09",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/brown_planks_09.png?width=256&height=256",
      },
      {
        id: "cherry_veneer",
        name: "Cherry Veneer",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/cherry_veneer.png?width=256&height=256",
      },
      {
        id: "chinese_cedar_bark",
        name: "Chinese Cedar Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/chinese_cedar_bark.png?width=256&height=256",
      },
      {
        id: "chinese_hackberry_bark",
        name: "Chinese Hackberry Bark",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/chinese_hackberry_bark.png?width=256&height=256",
      },
      {
        id: "coated_pine",
        name: "Coated Pine",
        thumb:
          "https://cdn.polyhaven.com/asset_img/thumbs/coated_pine.png?width=256&height=256",
      },
    ],
  },
];

// Alias for backwards compatibility
export const PBR_CATEGORIES = INTERIOR_PBR_CATEGORIES;
