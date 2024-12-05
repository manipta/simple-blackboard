import { createContext, useState, ReactNode, useContext } from "react";

// Define interface for Drawing Tool
interface DrawingTool {
  startDrawing(context: CanvasRenderingContext2D, x: number, y: number): void;
  continueDrawing(
    context: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void;
  stopDrawing(): void;
  setToolSize(size: number): void;
}

// Example tool: Chalk
class Chalk implements DrawingTool {
  private size: number = 5;

  startDrawing(context: CanvasRenderingContext2D, x: number, y: number): void {
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = this.size;
    context.lineCap = "round";
  }

  continueDrawing(
    context: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    context.lineTo(x, y);
    context.strokeStyle = "#fff";
    context.stroke();
  }

  stopDrawing(): void {
    // Stop logic
  }

  setToolSize(size: number): void {
    this.size = size;
  }
}

// Create context for Tool
const ToolContext = createContext<{
  tool: DrawingTool;
  setTool: (tool: DrawingTool) => void;
}>({ tool: new Chalk(), setTool: () => {} });

// Tool Provider component
export const ToolProvider = ({ children }: { children: ReactNode }) => {
  const [tool, setTool] = useState<DrawingTool>(new Chalk());

  return (
    <ToolContext.Provider value={{ tool, setTool }}>
      {children}
    </ToolContext.Provider>
  );
};

// Hook to use the Tool Context
export const useTool = () => useContext(ToolContext);
