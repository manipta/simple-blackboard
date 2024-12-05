import { DrawingTool, Point } from "../interfaces/main-canvas/DrawingTool";

export class Eraser implements DrawingTool {
  private thickness: number;

  constructor(thickness: number) {
    this.thickness = thickness;
  }

  startDrawing(canvasContext: CanvasRenderingContext2D, point1: Point) {
    canvasContext.beginPath();
    canvasContext.moveTo(point1.x, point1.y);
  }

  draw(canvasContext: CanvasRenderingContext2D, point1: Point, point2: Point) {
    canvasContext.clearRect(point1.x, point1.y, this.thickness, this.thickness);
  }

  stopDrawing() {
    // Logic to stop erasing (if any)
  }
}
