export interface Line { x1: number; y1: number; x2: number; y2: number; className: string; }
export interface Mark { x: number; y: number; className: string; }
export interface Rectangle { type: 'rectangle'; x: number; y: number; width: number; height: number; isChapter: boolean; }
export interface Polygon { type: 'polygon'; points: string; marks: Mark[]; isChapter: boolean; }
export interface Pages { type: 'pages'; x: number; }
export interface TextLine extends Line { id: string; type: 'text-line'; parent: Rectangle | Polygon; }

export type Shape = { id: string } & (Rectangle | Polygon | Pages | TextLine);
