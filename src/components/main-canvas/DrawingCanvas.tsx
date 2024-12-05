import { useEffect, useRef, useState } from "react";
import useCustomCursor from "../../services/hooks/useCustomCursor";
import Tools from "../tools/Tools";
import {
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MdLockOutline,
  MdEditNote,
  MdDelete,
  MdDeleteOutline,
} from "react-icons/md";
import { Point } from "../../interfaces/main-canvas/DrawingTool";
import { chalkDusterTheme } from "../../game-theme/chalk-duster/chalk-duster-theme";
import { useDrawerShell } from "../../services/providers/DrawerShellProvider";
import { DrawerShell } from "../ui/DrawerShell";
import { FiDelete } from "react-icons/fi";
import { BiArrowFromTop } from "react-icons/bi";

const DrawingCanvas = () => {
  // Theme Config
  // -------
  const penSpecialEffect = (
    canvasContext: CanvasRenderingContext2D,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number
  ) => {
    currentTheme.specialEffect(canvasContext, xStart, yStart, xEnd, yEnd);
  };
  const currentTheme = chalkDusterTheme;
  const penStroke = currentTheme.penStroke;
  const pen = currentTheme.pen;
  const eraser = currentTheme.duster;
  const boardBackground = currentTheme.board;
  penStroke.lineWidth = 5;
  // -------

  // const [line, setLine] = useState<Line>({ points: [] });
  const tempLinePoints = useRef<Point[]>([]);
  const isDrawing = useRef<Boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);
  const isLandscape = useRef<Boolean | null>(
    windowWidth.current > windowHeight.current
  );

  // const [isDrawing, setIsDrawing] = useState<Boolean>(false);
  const fancyCursor = useRef<Boolean>(false);

  const [pages, setPages] = useState<string[]>([]); // Store canvas data as Base64
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const saveStateToUndoStack = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setUndoStack((prev) => [...prev, dataURL]);
      setRedoStack([]); // Clear redo stack on new action
    }
  };
  const undo = () => {
    if (undoStack.length === 0) return;

    const canvasContext = getCanvasContext();
    if (canvasContext) {
      const previousState = undoStack.pop();
      setUndoStack([...undoStack]); // Update undoStack state
      const currentState = canvasRef.current?.toDataURL();
      if (currentState) setRedoStack((prev) => [...prev, currentState]);

      clearCanvas();
      if (previousState) {
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
          canvasContext.drawImage(img, 0, 0);
        };
      }
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const canvasContext = getCanvasContext();
    if (canvasContext) {
      const nextState = redoStack.pop();
      setRedoStack([...redoStack]); // Update redoStack state
      const currentState = canvasRef.current?.toDataURL();
      if (currentState) setUndoStack((prev) => [...prev, currentState]);

      clearCanvas();
      if (nextState) {
        const img = new Image();
        img.src = nextState;
        img.onload = () => {
          canvasContext.drawImage(img, 0, 0);
        };
      }
    }
  };

  // Save the current canvas state
  const saveCurrentPage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setPages((prevPages) => {
        const updatedPages = [...prevPages];
        updatedPages[currentPage] = dataURL;
        return updatedPages;
      });
    }
  };
  // Load a saved page onto the canvas
  const loadPage = (pageIndex: number) => {
    const canvasContext = getCanvasContext();
    if (canvasContext) {
      clearCanvas(); // Clear the current canvas
      const dataURL = pages[pageIndex];
      if (dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
          canvasContext.drawImage(img, 0, 0);
        };
      }
    }
  };
  const addNewPage = () => {
    saveCurrentPage(); // Save current page before switching
    setPages((prevPages) => [...prevPages, ""]);
    setCurrentPage(pages.length); // Switch to the new page
    clearCanvas();
  };

  const switchPage = (pageIndex: number) => {
    saveCurrentPage(); // Save the current page before switching
    setCurrentPage(pageIndex);
    loadPage(pageIndex); // Load the selected page
  };
  useEffect(() => {
    if (pages.length === 0) {
      setPages([""]);
    }
    resetCanvas();

    const handleTouch = (e: TouchEvent) => e.preventDefault();

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener("touchstart", handleTouch, {
        passive: false,
      });
      canvasElement.addEventListener("touchmove", handleTouch, {
        passive: false,
      });
      canvasElement.addEventListener("touchend", handleTouch, {
        passive: false,
      });
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("touchstart", handleTouch);
        canvasElement.removeEventListener("touchmove", handleTouch);
        canvasElement.removeEventListener("touchend", handleTouch);
      }
    };
  }, []);

  const { openDrawer } = useDrawerShell();

  const { x, y } = useCustomCursor();
  const getCanvasContext = () => canvasRef.current?.getContext("2d");

  const clearCanvas = () => {
    const canvasContext = getCanvasContext();
    if (canvasContext) {
      // Clear the entire canvas
      canvasContext.clearRect(
        0,
        0,
        canvasContext.canvas.width,
        canvasContext.canvas.height
      );
    }
  };

  const resetCanvas = () => {
    clearCanvas();
  };

  const draw = (point1: Point, point2: Point) => {
    const canvasContext = getCanvasContext();
    if (point1 && canvasContext) {
      canvasContext.beginPath();
      canvasContext.moveTo(point1.x, point1.y);
      canvasContext.lineTo(point2.x, point2.y);
      canvasContext.strokeStyle = penStroke.strokeStyle;
      canvasContext.lineWidth = penStroke?.lineWidth || 3;
      canvasContext.lineCap = penStroke.lineCap;
      canvasContext.stroke();
      penSpecialEffect(canvasContext, point1.x, point1.y, point2.x, point2.y);
    }
  };

  const handleMouseDown = (
    e: MouseEvent | TouchEvent | { clientX: number; clientY: number }
  ) => {
    saveStateToUndoStack();
    const isTouchEvent = "touches" in e;
    const canvasContext = getCanvasContext();
    if (!canvasContext) return;

    isDrawing.current = true;
    const rect = canvasContext.canvas.getBoundingClientRect();
    const startX = isTouchEvent
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const startY = isTouchEvent
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;
    const point1 = {
      x: startX - 0.5 * penStroke.lineWidth,
      y: startY - 0.5 * penStroke.lineWidth,
    };
    const point2 = { x: startX, y: startY };
    draw(point1, point2);
    tempLinePoints.current = [{ x: startX, y: startY }];
    // addPoint(point2);
    // setIsDrawing(true);
  };
  const handleMouseMove = (
    e: MouseEvent | TouchEvent | { clientX: number; clientY: number }
  ) => {
    const isTouchEvent = "touches" in e;
    const canvasContext = getCanvasContext();
    if (!canvasContext) return;

    const rect = canvasContext.canvas.getBoundingClientRect();
    const startX = isTouchEvent
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left;
    const startY = isTouchEvent
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top;
    const point = { x: startX, y: startY };
    if (isDrawing.current) {
      const lastPoint =
        tempLinePoints.current[tempLinePoints.current.length - 1];
      draw(lastPoint, point);
      // Add the point to the temp line points
      tempLinePoints.current.push({ ...point });
      // addPoint(point);
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const isOutside =
      touch.clientX < rect.left ||
      touch.clientX > rect.right ||
      touch.clientY < rect.top ||
      touch.clientY > rect.bottom;
    isOutside ? handleMouseUp() : handleMouseMove(e);
  };
  const handleMouseUp = () => {
    // setIsDrawing(false);
    isDrawing.current = false;
  };

  return (
    <>
      <DrawerShell
        menu={
          <div className="h-full flex flex-col justify-between absolute">
            <div>
              Hi
              <ListItem>
                <ListItemButton
                  onClick={() => console.log("HI")}
                  sx={{ borderRadius: "8px" }}
                >
                  <ListItemIcon>
                    <MdLockOutline size="24" />
                  </ListItemIcon>
                  <ListItemText primary="Reset Password" />
                </ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton
                  onClick={() => console.log("HI")}
                  sx={{
                    // backgroundColor: `${isActive ? "rgba(0, 0, 0, 0.05)" : ""}`,
                    borderRadius: "8px",
                  }}
                >
                  <ListItemIcon>
                    <MdEditNote size="24" />
                  </ListItemIcon>
                  <ListItemText primary="School Profile" />
                </ListItemButton>
              </ListItem>
            </div>
          </div>
        }
        children={undefined}
      ></DrawerShell>
      <div
        className="flex flex-col m-0 p-0 "
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={(e) => handleMouseMove(e)}
        onMouseUp={() => handleMouseUp()}
        onMouseLeave={() => {
          handleMouseUp();
          fancyCursor.current = false;
        }}
        onMouseEnter={() => {
          fancyCursor.current = true;
        }}
        onTouchStart={(e: any) => handleMouseDown(e)}
        onTouchMove={(e: any) => handleTouchMove(e)}
        onTouchEnd={() => handleMouseUp()}
        onTouchCancel={() => handleMouseUp()}
      >
        <div>
          {/* Duster positioned dynamically */}
          {
            // <div
            //   className={`absolute z-10`}
            //   id="duster"
            //   style={{
            //     width: `${
            //       (isLandscape.current
            //         ? windowWidth.current
            //         : windowHeight.current) * 0.1
            //     }px`,
            //     height:
            //       (isLandscape.current
            //         ? windowWidth.current
            //         : windowHeight.current) / 24,
            //     background: `url(${eraser})`,
            //     backgroundSize: "contain",
            //     backgroundRepeat: "no-repeat",
            //     left: isLandscape.current
            //       ? (windowWidth.current * 5.1) / 6
            //       : windowWidth.current / 6,
            //     top: isLandscape.current
            //       ? (windowHeight.current * 5) / 6 - windowHeight.current * 0.1
            //       : (windowHeight.current * 5.1) / 6 +
            //         windowHeight.current * 0.05,
            //     // client top +duster height+ canvas height
            //     transform: `${isLandscape.current ? " " : "rotateZ(90deg)"}`,
            //   }}
            // />
          }

          {(isDrawing.current || fancyCursor.current) && (
            <div
              className="custom-cursor fixed z-10 w-10 h-12 "
              style={{
                background: `url(${pen})`,
                // backgroundColor: "white",
                // backgroundColor: "white",
                backgroundSize: "auto",
                backgroundRepeat: "no-repeat",
                left: `${x + window.innerWidth * 0.001}px`,
                top: `${y + window.innerWidth * 0.001}px`,
                cursor: `none`,
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={windowWidth.current - 20}
            height={windowHeight.current - 60}
            style={{
              // position: "static",
              boxShadow: "5px 5px 2px black",
              borderRadius: "5px",
              border: "8px solid #bc8c5c",
              background: `url(${boardBackground})`,
              marginTop: 0,
              backgroundColor: "#274c43",
              cursor: `none`,
            }}
          ></canvas>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="tools">
          <div className="clearScreen">
            <Button onClick={() => clearCanvas()}>
              <MdDeleteOutline size={30} />
            </Button>
          </div>
          {pages.map((_, index) => (
            <Button
              key={index}
              variant={index === currentPage ? "contained" : "outlined"}
              onClick={() => switchPage(index)}
            >
              Page {index + 1}
            </Button>
          ))}

          <Button onClick={addNewPage}>Add New Page</Button>
          <Button onClick={undo}>Undo</Button>
          <Button onClick={redo}>Redo</Button>
        </div>
        <Button onClick={() => openDrawer()} style={{ color: "white " }}>
          <BiArrowFromTop />
        </Button>
      </div>
    </>
  );
};

export default DrawingCanvas;
