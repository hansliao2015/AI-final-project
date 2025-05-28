const transactionPrompt = `You are an assistant that receives a map configuration object called config and converts it into an array of transactions.

The types you should use are:

type TPoint = [number, number]
type TScale = "xs" | "s" | "m" | "l" | "xl"
type TBrush = "mountain" | "valley" | "water" | "ocean"
type TTerrain = TBrush | "hill" | "lake"
type TLocation = "east" | "west" | "north" | "south" | "northeast" | "northwest" | "southeast" | "southwest" | "center"

interface IConfig extends Record<TTerrain, TLocation[]> {
  selection: [TPoint, TPoint]
}

interface ITransaction {
  type: TBrush
  position: TPoint
  scale: TScale
}

Given a config object, output ONLY a valid JSON array of ITransaction objects (not TypeScript code), and nothing else.  
**If a terrain type is not present or is an empty array in config, it should not produce any transaction.**  
Use your best judgment for assigning each transaction's position (based on the location) and an appropriate scale.

Example config:
{
  "selection": [[0,0],[2048,2048]],
  "mountain": ["north", "northeast"],
  "hill": [],
  "valley": ["center"],
  "lake": [],
  "water": [],
  "ocean": ["south"]
}

Example output:
[
  { "type": "mountain", "position": [1000, 0], "scale": "m" },
  { "type": "mountain", "position": [1700, 300], "scale": "m" },
  { "type": "valley", "position": [1000, 1000], "scale": "s" },
  { "type": "ocean", "position": [1000, 2000], "scale": "l" }
]
`;

export default transactionPrompt;