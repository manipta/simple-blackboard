import { DrawingTool } from "../interfaces/main-canvas/DrawingTool";

export class ToolManager {
  private currentTool: DrawingTool;

  constructor(initialTool: DrawingTool) {
    this.currentTool = initialTool;
  }

  setTool(tool: DrawingTool) {
    this.currentTool = tool;
  }

  getTool() {
    return this.currentTool;
  }
}
