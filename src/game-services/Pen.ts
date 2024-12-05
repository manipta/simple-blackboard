import {
  DrawingTool,
  PenStyle,
  Point,
} from "../interfaces/main-canvas/DrawingTool";

export class Pen implements DrawingTool {
  private penStyle: PenStyle;

  constructor(penStyle: PenStyle) {
    this.penStyle = penStyle;
  }

  startDrawing(canvasContext: CanvasRenderingContext2D, point1: Point) {
    canvasContext.beginPath();
    canvasContext.moveTo(point1.x, point1.y);
  }

  draw(canvasContext: CanvasRenderingContext2D, point1: Point, point2: Point) {
    canvasContext.lineTo(point2.x, point2.y);
    canvasContext.strokeStyle = this.penStyle.strokeStyle;
    canvasContext.lineWidth = this.penStyle.lineWidth;
    canvasContext.lineCap = this.penStyle.lineCap;
    canvasContext.stroke();
  }

  stopDrawing() {
    // Logic to stop drawing (e.g., reset states, if needed)
  }
}
