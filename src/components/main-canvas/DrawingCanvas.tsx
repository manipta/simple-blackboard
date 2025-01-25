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
const DrawingCanvas = () => {
  // Theme Config
  // -------
  const { chalkEffect, chalkAnimation } = useSettings();
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
  const boardBackground = currentTheme.board;
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
  } = useCanvasDataProvider();

  const { favouriteColorsList, index } = useColorPalette();

  useEffect(() => {
    if (pages.length === 0) {
      setPages([""]);
    }
    // saveStateToUndoStack();
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
        canvasContext.lineCap = "round";
        canvasContext.clearRect(
          x - eraserSize / 2,
          y - eraserSize / 2,
          eraserSize,
          eraserSize
        ); // Erase
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

  // const exportToPDF = async () => {
  //   // ... (Your logic to prepare pages)

  //   if (pages.length === 0) {
  //     console.error("No pages to export");
  //     return;
  //   }

  //   const pdfData = await Plugins.JSPDF.create({
  //     orientation: "portrait", // Or "landscape"
  //     unit: "mm", // Or "pt", "in", "cm"
  //     format: "a4", // Or other supported formats
  //     // ... other options specific to the plugin
  //   });

  //   // Process pages sequentially using the plugin's methods
  //   for (let index = 0; index < pages.length; index++) {
  //     try {
  //       const imageData = await Plugins.Storage.get({ key: pages[index] }); // Assuming pages contain base64 encoded images
  //       await Plugins.JSPDF.addImage(pdfData, imageData.value, index); // Add image to PDF using the plugin
  //       // ... other actions specific to the plugin
  //     } catch (error) {
  //       console.error("Error generating PDF:", error);
  //     }
  //   }

  //   // Save the PDF using the plugin's methods
  //   await Plugins.JSPDF.save(pdfData, "multi-page.pdf");
  // };
  // const exportCanvasToPDF = async () => {
  //   try {
  //     // Load external libraries dynamically
  //     await loadScript(
  //       "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  //     );
  //     await loadScript(
  //       "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  //     );

  //     const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

  //     if (!canvas) {
  //       console.error("Canvas element not found");
  //       return;
  //     }

  //     // Access loaded libraries
  //     const html2canvas = (window as any).html2canvas;
  //     const { jsPDF } = (window as any).jspdf;

  //     // Convert canvas to image
  //     const canvasImage = await html2canvas(canvas);
  //     const imageData = canvasImage.toDataURL("image/png");

  //     // Create PDF
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pdfWidth = 210;
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //     pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
  //     pdf.save("canvas.pdf");
  //   } catch (error) {
  //     console.error("Error exporting to PDF:", error);
  //   }
  // };
  if (showPreview)
    return (
      <div>
        <PagePreviewer pages={pages} />
      </div>
    );
  return (
    <div className="flex flex-col w-full">
      {showMainMenu ? (
        <MainMenu></MainMenu>
      ) : (
        <div>
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
                width={windowWidth.current - 16}
                height={windowHeight.current - 120}
                style={{
                  // position: "static",
                  boxShadow: "5px 5px 2px black",
                  borderRadius: "5px",
                  border: "8px solid #bc8c5c",
                  background: `url(${boardBackground})`,
                  marginTop: 0,
                  backgroundColor: "red",
                  // backgroundColor: "#274c43",
                  cursor: `none`,
                }}
              ></canvas>
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
