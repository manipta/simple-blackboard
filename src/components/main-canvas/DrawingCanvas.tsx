import { useEffect, useRef, useState } from "react";
import useCustomCursor from "../../services/hooks/useCustomCursor";
import "./DrawingCanvas.scss";
import {
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import {
  MdLockOutline,
  MdEditNote,
  MdDeleteOutline,
  MdNoteAdd,
  MdUndo,
  MdRedo,
  MdDraw,
} from "react-icons/md";
import { Point } from "../../interfaces/main-canvas/DrawingTool";
import { chalkDusterTheme } from "../../game-theme/chalk-duster/chalk-duster-theme";
import { useDrawerShell } from "../../services/providers/DrawerShellProvider";
import { DrawerShell } from "../ui/DrawerShell";
import { BiArrowFromTop } from "react-icons/bi";
import { BsEraserFill } from "react-icons/bs";

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
  const [strokeSize, setStrokeSize] = useState(0);
  const [eraserSize, setEraserSize] = useState(10);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isEraser, setIsEraser] = useState(false); // Tracks if eraser is selected
  const [, setUndoRedoStack] = useState<
    { undoStack: string[]; redoStack: string[] }[]
  >([{ undoStack: [], redoStack: [] }]);

  const captureSnapshot = () => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL();
    }
    return null;
  };

  const toggleTool = () => {
    setIsEraser(!isEraser);
  };

  const restoreSnapshot = (snapshot: string) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = snapshot;
      img.onload = () => {
        ctx?.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
        ctx?.drawImage(img, 0, 0);
      };
    }
  };

  const saveStateToUndoStack = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setUndoRedoStack((prev) => {
        const updatedStack = [...prev];
        updatedStack[currentPage].undoStack.push(dataURL);
        updatedStack[currentPage].redoStack = []; // Clear redo stack
        return updatedStack;
      });
    }
  };
  const undo = () => {
    setUndoRedoStack((prev) => {
      const updatedStack = [...prev];
      const undoStack = updatedStack[currentPage].undoStack;
      const redoStack = updatedStack[currentPage].redoStack;

      if (undoStack.length > 0) {
        const currentState = canvasRef.current?.toDataURL();
        if (currentState) redoStack.push(currentState);

        const previousState = undoStack.pop();
        if (previousState) restoreSnapshot(previousState);
      }

      return updatedStack;
    });
  };

  const redo = () => {
    setUndoRedoStack((prev) => {
      const updatedStack = [...prev];
      const undoStack = updatedStack[currentPage].undoStack;
      const redoStack = updatedStack[currentPage].redoStack;

      if (redoStack.length > 0) {
        const currentState = canvasRef.current?.toDataURL();
        if (currentState) undoStack.push(currentState);

        const nextState = redoStack.pop();
        if (nextState) restoreSnapshot(nextState);
      }

      return updatedStack;
    });
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
  const deletePage = (pageIndex: number) => {
    console.log("Deleting", pageIndex);
    if (pages.length === 1) {
      alert("Ensures at least one page");
      return;
    } // Ensure at least one page exists

    setPages((prev) => {
      const updatedPages = [...prev];
      updatedPages.splice(pageIndex, 1); // Remove the page
      return updatedPages;
    });

    setUndoRedoStack((prev) => {
      const updatedStack = [...prev];
      updatedStack.splice(pageIndex, 1); // Remove the undo/redo stack
      return updatedStack;
    });
    setCurrentPage((prev) => {
      const newPage =
        prev === pageIndex
          ? Math.max(0, prev - 1)
          : prev > pageIndex
          ? prev - 1
          : prev;
      console.log("New current page:", newPage);
      return newPage;
    });
    // if (currentPage != pageIndex) {
    //   setCurrentPage((prev) => Math.max(0, prev - 1));
    // } else {
    //   // Adjust current page
    //   setCurrentPage((prev) => {
    //     const newPage = prev > pageIndex ? prev - 1 : Math.max(0, prev - 1);
    //     loadPage(newPage); // Safely load the new current page
    //     return newPage;
    //   });
    // }
  };

  // const loadStacks = (pageIndex: number) => {
  //   undoRedoStacks.current[currentPage].undoStack.push();
  // };
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
  const addPageAtPosition = (position: number) => {
    saveStateToUndoStack(); // Save the current page state before modifying

    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages.splice(position, 0, ""); // Insert a blank page at the desired position
      return newPages;
    });

    setUndoRedoStack((prevStacks) => {
      const newStacks = [...prevStacks];
      newStacks.splice(position, 0, { undoStack: [], redoStack: [] }); // Add a fresh undo/redo stack
      return newStacks;
    });

    setCurrentPage(position); // Switch to the newly added page
    clearCanvas();
  };

  const addNewPage = () => {
    saveCurrentPage();

    setPages((prev) => [...prev, ""]); // Add new blank page
    setUndoRedoStack((prev) => [...prev, { undoStack: [], redoStack: [] }]); // Add new undo/redo stack
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

  function isCanvasClear() {
    const ctx = getCanvasContext();
    if (!ctx) return;
    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current?.width || 0,
      canvasRef.current?.height || 0
    );

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] !== 0 ||
        data[i + 1] !== 0 ||
        data[i + 2] !== 0 ||
        data[i + 3] !== 0
      ) {
        return false; // Found a non-transparent black pixel, canvas is not clear
      }
    }

    return true; // All pixels are transparent black, canvas is clear
  }

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

      if (isEraser) {
        canvasContext.strokeStyle = "red";
        canvasContext.lineWidth = 1;
        canvasContext.clearRect(
          x - eraserSize / 2,
          y - eraserSize / 2,
          eraserSize,
          eraserSize
        ); // Erase
      } else {
        canvasContext.strokeStyle = penStroke.strokeStyle;
        canvasContext.lineWidth = penStroke?.lineWidth || 3;
        canvasContext.lineCap = penStroke.lineCap;
        canvasContext.stroke();
        penSpecialEffect(canvasContext, point1.x, point1.y, point2.x, point2.y);
      }
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
      x: startX - 0.5 * penStroke.lineWidth!,
      y: startY - 0.5 * penStroke.lineWidth!,
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

  const clearScreen = () => {
    if (isCanvasClear()) return;
    saveStateToUndoStack();

    clearCanvas();
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
          {isEraser && isDrawing.current && (
            <div
              onDrag={(e) => {
                e.preventDefault();
              }}
              onClick={() => {}}
              className="fixed border-2 border-white"
              style={{
                position: "fixed",
                width: eraserSize,
                height: eraserSize,
                left: `${x - eraserSize / 2}px`,
                top: `${y - eraserSize / 2}px`,
              }}
            />
          )}
          {isDrawing.current && (
            <div
              className={`custom-cursor fixed z-10 w-10 h-12 select-none no-drag ${
                isEraser ? "" : null
              } `}
              style={{
                backgroundImage: `url(${
                  isEraser ? "/assets/duster2.png" : pen
                })`,
                // backgroundColor: "white",
                // backgroundColor: "white",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                left: `${x + window.innerWidth * 0.001}px`,
                top: `${y + window.innerWidth * 0.001}px`,
                cursor: `none`,
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={windowWidth.current - 16}
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
      <div className="flex flex-col">
        <div className="tools">
          <div className="clearScreen"></div>
          <Button onClick={() => clearScreen()}>
            <MdDeleteOutline size={20} />
          </Button>
          <Select
            className="custom-select"
            style={{
              border: "none", // Remove border
              outline: "none", // Remove outline
              width: 100,
              fontSize: 5,
            }}
            value={currentPage}
            onChange={(e) => switchPage(+e.target.value)}
          >
            {pages.map((_, index) => (
              <MenuItem key={index} value={index}>
                <Button
                  style={{ width: "30%", fontSize: 12 }}
                  className="text-sm"
                  variant={index === currentPage ? "contained" : "outlined"}
                  // onClick={() => switchPage(index)}
                >
                  Page {index + 1}
                </Button>
                <IconButton
                  onClick={() => {
                    deletePage(index);
                  }}
                >
                  X
                </IconButton>
              </MenuItem>
            ))}
          </Select>

          <Button onClick={addNewPage}>
            <MdNoteAdd size={20} />
          </Button>
          <Button onClick={undo}>
            <MdUndo size={20} />
          </Button>
          <Button onClick={redo}>
            <MdRedo size={20} />
          </Button>
          <Button onClick={toggleTool}>
            {isEraser ? <MdDraw size={20} /> : <BsEraserFill size={20} />}
          </Button>
          <Button onClick={() => openDrawer()} style={{ color: "white " }}>
            <BiArrowFromTop />
          </Button>
          <Button
            onClick={() => deletePage(currentPage)}
            style={{ color: "white " }}
          >
            Delete this page
          </Button>
          <Button
            onClick={() => addPageAtPosition(currentPage)}
            style={{ color: "white " }}
          >
            Add before this page
          </Button>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default DrawingCanvas;
