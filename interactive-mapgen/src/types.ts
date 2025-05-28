export type TPoint = [number, number]
export type TScale = "xs" | "s" | "m" | "l" | "xl"
export type TBrush = "mountain" | "valley" | "water" | "ocean"
export type TTerrain = TBrush | "hill" | "lake"
export type TLocation = "east" | "west" | "north" | "south" | "northeast" | "northwest" | "southeast" | "southwest" | "center"

export interface IConfig extends Record<TTerrain, TLocation[]> {
  selection: [TPoint, TPoint]
}

export interface ITransation {
  type: TBrush
  position: TPoint
  scale: TScale
}
