export interface Point {
  x: number;
  y: number;
}

export interface DrawingTool {
  startDrawing: (
    canvasContext: CanvasRenderingContext2D,
    point1: Point
  ) => void;
  draw: (
    canvasContext: CanvasRenderingContext2D,
    point1: Point,
    point2: Point
  ) => void;
  stopDrawing: () => void;
}

export interface PenStyle {
  lineCap: CanvasLineCap;
  lineWidth: number;
  strokeStyle: string;
}
export interface Theme {
  penStroke: {
    lineWidth?: number;
    lineCap: CanvasLineCap;
    strokeStyle: string;
  };
  board: string;
  pen: string;
  duster: string;
  specialEffect: (
    canvasContext: CanvasRenderingContext2D,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number
  ) => void;
}
