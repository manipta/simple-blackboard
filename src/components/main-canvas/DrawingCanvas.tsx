import { useEffect, useRef } from "react";
import useCustomCursor from "../../services/hooks/useCustomCursor";
import "./DrawingCanvas.scss";
import { Point } from "../../interfaces/main-canvas/DrawingTool";
import { chalkDusterTheme } from "../../game-theme/chalk-duster/chalk-duster-theme";
import { DrawerShell } from "../ui/DrawerShell";
import ColorPicker from "../color-picker/ColorPicker";
import { useColorPalette } from "../color-picker/ColorPalette";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import BottomToolbar from "../bottom-toolbar/BottomToolbar";
import PagePreviewer from "../pages-previewer/PagePreviewer";
import MainMenu from "../main-menu/MainMenu";
import { useSettings } from "../../services/providers/SettingsProvider";
import DemoInsertImage from "./DemoInsertImage";
const DrawingCanvas = () => {
  // Theme Config
  // -------
  const { chalkEffect, chalkAnimation, boardConfig } = useSettings();
  const penSpecialEffect = (
    canvasContext: CanvasRenderingContext2D,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
    strokeSize: number
  ) => {
    currentTheme.specialEffect(
      canvasContext,
      xStart,
      yStart,
      xEnd,
      yEnd,
      strokeSize
    );
  };
  const currentTheme = chalkDusterTheme;
  const penStroke = currentTheme.penStroke;
  const pen = currentTheme.pen;
  // const eraser = currentTheme.duster;
  // const boardBackground = currentTheme.board;
  // -------

  // const [line, setLine] = useState<Line>({ points: [] });
  const tempLinePoints = useRef<Point[]>([]);
  const isDrawing = useRef<Boolean>(false);
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);
  // const isLandscape = useRef<Boolean | null>(
  //   windowWidth.current > windowHeight.current
  // );

  // const [isDrawing, setIsDrawing] = useState<Boolean>(false);
  const fancyCursor = useRef<Boolean>(false);

  const {
    pages,
    saveStateToUndoStack,
    setPages,
    eraserSize,
    isEraser,
    getCanvasContext,
    strokeSize,
    canvasRef,
    resetCanvas,
    saveCurrentPage,
    showPreview,
    showMainMenu,
    isLoading,
    showImageMenu,
  } = useCanvasDataProvider();

  const { favouriteColorsList, index } = useColorPalette();

  const clearCircle = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ) => {
    context.save(); // Save the current state
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.clip();
    context.clearRect(
      x - radius - 1,
      y - radius - 1,
      radius * 2 + 2,
      radius * 2 + 2
    );

    context.restore(); // Restore state to avoid affecting other drawings
  };

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      const ctx = canvasElement.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      // Reset transform before scaling to prevent compounding if useEffect runs twice
      ctx?.setTransform(1, 0, 0, 1, 0, 0);
      ctx?.scale(dpr, dpr);
    }

    if (pages.length === 0) {
      setPages([""]);
    }
    // saveStateToUndoStack();
    resetCanvas();

    const handleTouch = (e: TouchEvent) => e.preventDefault();

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
  useEffect(() => {
    if (!showMainMenu && !showPreview) {
      resetCanvas();
    }
  }, [showPreview, showMainMenu]);
  const { x, y } = useCustomCursor();

  const draw = (point1: Point, point2: Point) => {
    const canvasContext = getCanvasContext();
    if (point1 && canvasContext) {
      canvasContext.beginPath();
      canvasContext.moveTo(point1.x, point1.y);
      canvasContext.lineTo(point2.x, point2.y);
      if (isEraser) {
        // canvasContext.strokeStyle = "red";
        // canvasContext.lineWidth = 1;
        canvasContext.lineCap = "round" as CanvasLineCap;
        // canvasContext.clearRect(
        //   x - eraserSize / 2,
        //   y - eraserSize / 2,
        //   eraserSize,
        //   eraserSize
        // ); // Erase
        clearCircle(canvasContext, point1.x, point1.y, eraserSize / 2);
      } else {
        canvasContext.strokeStyle = favouriteColorsList[index];
        canvasContext.lineWidth = strokeSize;
        canvasContext.lineCap = penStroke.lineCap;
        canvasContext.stroke();
        if (chalkEffect)
          penSpecialEffect(
            canvasContext,
            point1.x,
            point1.y,
            point2.x,
            point2.y,
            strokeSize
          );
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
      x: startX - 0.5 * strokeSize,
      y: startY - 0.5 * strokeSize,
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
    saveCurrentPage();
    isDrawing.current = false;
  };

  if (showPreview)
    return (
      <div>
        <PagePreviewer pages={pages} />
      </div>
    );
  return (
    <div className="flex flex-col w-full h-screen">
      {showMainMenu ? (
        <MainMenu />
      ) : (
        <div>
          {isLoading && (
            <div className="h-full w-full content-center text-center bg-black text-white text-2xl">
              Loading...
            </div>
          )}
          <DrawerShell
            height={370}
            children={undefined}
            menu={
              <div className=" flex flex-col absolute p-2 items-center justify-center w-full h-fit z-10">
                <div>
                  <ColorPicker />
                </div>
              </div>
            }
          />

          <div
            className="flex flex-col m-0 p-0 "
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => {
              handleMouseMove(e);
              e.preventDefault();
              // e.stopPropagation();
            }}
            onMouseUp={() => handleMouseUp()}
            onMouseLeave={() => {
              handleMouseUp();
              fancyCursor.current = false;
            }}
            onMouseEnter={() => {
              fancyCursor.current = true;
            }}
            onTouchStart={(e: any) => handleMouseDown(e)}
            onTouchMove={(e: any) => {
              handleTouchMove(e);
              e.preventDefault();
              // e.stopPropagation();
            }}
            onTouchEnd={() => handleMouseUp()}
            onTouchCancel={() => handleMouseUp()}
          >
            <div
              style={{
                // position: "static",
                boxShadow: "5px 5px 2px black",
                borderRadius: "8px",
                border: "8px solid #bc8c5c",
                background:
                  boardConfig.type == "image"
                    ? `url(${boardConfig.board})`
                    : boardConfig.board,
                marginTop: 0,
                // backgroundColor: "red",
                // backgroundColor: "#274c43",
                cursor: `none`,
              }}
            >
              {showImageMenu && (
                <div className=" absolute">
                  <DemoInsertImage
                    width={windowWidth.current - 16}
                    height={windowHeight.current - 120}
                  />
                </div>
              )}
              <div>
                {isEraser && isDrawing.current && (
                  <div
                    onDrag={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => {}}
                    className="fixed border-2 border-white rounded-full"
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
                        chalkAnimation
                          ? isEraser
                            ? "/assets/duster2.png"
                            : pen
                          : ""
                      })`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      left: `${x + window.innerWidth * 0.001}px`,
                      top: `${y + window.innerWidth * 0.001}px`,
                      cursor: `none`,
                    }}
                  />
                )}
                <canvas
                  id="myCanvas"
                  ref={canvasRef}
                  width={(windowWidth.current - 16) * (window.devicePixelRatio || 1)}
                  height={(windowHeight.current - 120) * (window.devicePixelRatio || 1)}
                  style={{
                     width: `${windowWidth.current - 16}px`,
                     height: `${windowHeight.current - 120}px`,
                  }}
                ></canvas>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <BottomToolbar />
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
