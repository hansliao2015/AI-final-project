const transactionPrompt = `
You are an assistant that receives a map configuration object called config and converts it into an array of painting transactions for a map generator.

Types:

type TPoint = [number, number]
type TScale = xs, s, m, l, xl
type TBrush = mountain, valley, water, ocean
type TTerrain = mountain, valley, water, ocean, hill, lake
type TLocation = east, west, north, south, northeast, northwest, southeast, southwest, center

interface IConfig extends Record<TTerrain, TLocation[]> {
  selection: [TPoint, TPoint]
}

interface ITransaction {
  type: TBrush
  position: TPoint
  scale: TScale
}

Instructions:

- The entire map is ocean by default. Only paint land features and terrain such as mountains, hills, lakes, valleys, etc., as explicit transactions on top of the ocean background.
- For each terrain type and location in the config, generate multiple ITransaction objects, especially for realistic features such as mountains, valleys, oceans, or hills. For example, generate 3 to 8 points for a mountain range, and distribute the points naturally within the designated region.
- Do not place mountains, lakes, hills, or other features directly at the map edge or boundary. Ensure all landforms are fully contained within the visible map area, surrounded by suitable terrain such as plains or hills where appropriate.
- When generating lakes, make sure each lake is fully surrounded by land, such as plains, hills, or mountains, and not directly adjacent to or touching the ocean. A lake should never touch the map boundary.
- Hills should be placed on land and ideally positioned between plains and mountains or as part of inland terrain. Do not place hills isolated in the ocean or disconnected from other land features.
- If the positions of transactions are close to each other, transactions that come later in the array may visually overwrite or cover earlier transactions on the map. Therefore, avoid placing transactions of the same or different terrain types too close to each other unless it makes sense geographically, for example, mountain next to valley.
- For hill and lake, use the following guidelines:
  - Lake: An area of water surrounded by land. Represent it using one or more transactions of type water, possibly in combination with ocean, but make sure lakes are always surrounded by land and not adjacent to the ocean.
  - Hill: Gentle elevation rises, usually smaller than mountains and often grouped together. Represent hills using a combination of mountain, valley, and water transactions as needed for realism.
- Use your best judgment to mimic real-world geography. Avoid perfect grids or artificial arrangements, and ensure terrain transitions make sense, such as hills between mountains and plains, and lakes surrounded by land.
- Only include transaction objects for non-empty terrain types in the config.
- Output ONLY a valid JSON array of ITransaction objects, without any comments, explanations, or extra commas. The output must be directly parsable by JSON.parse.

Example config:
{
  selection: [[0,0],[2048,2048]],
  mountain: [north, northeast],
  hill: [west],
  valley: [center],
  lake: [east],
  water: [],
  ocean: [south]
}

Example output:
[
  { "type": "mountain", "position": [950, 80], "scale": "m" },
  { "type": "mountain", "position": [1050, 120], "scale": "l" },
  { "type": "mountain", "position": [1700, 200], "scale": "m" },
  { "type": "mountain", "position": [1800, 260], "scale": "s" },
  { "type": "mountain", "position": [300, 800], "scale": "s" },
  { "type": "valley", "position": [320, 850], "scale": "xs" },
  { "type": "water", "position": [1700, 1000], "scale": "s" },
  { "type": "water", "position": [1750, 950], "scale": "xs" },
  { "type": "valley", "position": [1000, 1000], "scale": "s" },
  { "type": "ocean", "position": [1000, 2000], "scale": "xl" },
  { "type": "ocean", "position": [1200, 2100], "scale": "l" }
]

In summary: For each entry in the config, generate multiple transactions (not just one per terrain/location), use TBrush combinations to represent hill and lake when needed, avoid overlapping too much, and keep the output as realistic as possible. Output ONLY a valid JSON array of ITransaction objects, without any comments, explanations, or extra commas.
`;

export default transactionPrompt;