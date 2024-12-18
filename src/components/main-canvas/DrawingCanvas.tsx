import { useEffect, useRef, useState } from "react";
import useCustomCursor from "../../services/hooks/useCustomCursor";
import "./DrawingCanvas.scss";
import { Button, IconButton, MenuItem, Select, Tooltip } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ColorLensTwoToneIcon from "@mui/icons-material/ColorLensTwoTone";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import {
  MdDeleteOutline,
  MdNoteAdd,
  MdUndo,
  MdRedo,
  MdDraw,
  MdOutlineUndo,
  MdDelete,
  MdArrowDropDown,
  MdAddCard,
} from "react-icons/md";
import { Color, Point } from "../../interfaces/main-canvas/DrawingTool";
import { chalkDusterTheme } from "../../game-theme/chalk-duster/chalk-duster-theme";
import { useDrawerShell } from "../../services/providers/DrawerShellProvider";
import { DrawerShell } from "../ui/DrawerShell";
import { BsEraserFill } from "react-icons/bs";
import { penSizes } from "../../constants";
import ColorPicker from "../color-picker/ColorPicker";
const DrawingCanvas = () => {
  // Theme Config
  // -------
  const penSpecialEffect = (
    canvasContext: CanvasRenderingContext2D,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
    brushDiameter: number
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
  const [strokeSize, setStrokeSize] = useState(2);
  const [eraserSize, setEraserSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false); // Tracks if eraser is selected
  // State with a default color (HSL with Alpha)
  const [color, setColor] = useState({
    hue: 360, // (0-360)
    saturation: 1, //(0-1)
    luminosity: 1, //(0-1)
    alpha: 1, //(0-1)
  });
  useEffect(() => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.strokeStyle = getColorString(color, "rgba");
  }, [color]);
  const [undoRedoStack, setUndoRedoStack] = useState<
    { undoStack: string[]; redoStack: string[] }[]
  >([{ undoStack: [], redoStack: [] }]);

  const toggleTool = () => {
    setIsEraser(!isEraser);
  };
  const handleSizeChange = (e) => {
    isEraser
      ? setEraserSize(e.target.value * 10)
      : setStrokeSize(e.target.value);
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
    // saveStateToUndoStack();
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
    console.log("savinggg...");
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
    console.log("Deleting page at index:", pageIndex);

    if (pages.length === 1) {
      alert("Ensures at least one page");
      return;
    }

    // Calculate updated pages and undoRedoStack **before updating state**
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    const updatedUndoRedoStack = undoRedoStack.filter(
      (_, index) => index !== pageIndex
    );

    // Determine the new current page safely
    const newPageIndex =
      // Handling edge case when 1st page being deleted
      currentPage >= pageIndex ? Math.max(0, currentPage - 1) : currentPage;
    console.log("New pages:", updatedPages, "New current page:", newPageIndex);

    // Update states
    setPages(updatedPages);
    setUndoRedoStack(updatedUndoRedoStack);
    setCurrentPage(newPageIndex);

    // Load the new page after state updates
    clearCanvas();
    loadData(updatedPages[newPageIndex]);
  };

  const loadData = (dataURL: string) => {
    const canvasContext = getCanvasContext();
    if (!canvasContext) return;
    if (dataURL) {
      const img = new Image();
      img.src = dataURL;
      img.onload = () => {
        canvasContext.drawImage(img, 0, 0);
      };
    }
  };
  const loadPage = (pageIndex: number) => {
    console.log("Loading", pageIndex);
    console.log(pages);
    const canvasContext = getCanvasContext();
    if (canvasContext) {
      if (pageIndex >= 0 && pageIndex < pages.length) {
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
    } else {
      console.warn("Invalid page index:", pageIndex);
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
    // saveCurrentPage(); // Save the current page before switching
    setCurrentPage(pageIndex);
    loadPage(pageIndex); // Load the selected page
  };
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

  function getColorString(
    color: Color,
    format: "hex" | "hsl" | "rgba"
  ): string {
    const { hue, saturation, luminosity, alpha } = color;

    switch (format) {
      case "hex":
        return hslToHex(hue, saturation, luminosity, alpha);

      case "hsl":
        return `hsl(${hue}, ${saturation}%, ${luminosity}%)`;

      case "rgba":
        const [r, g, b] = hslToRgb(hue, saturation, luminosity);
        return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`;

      default:
        throw new Error(
          "Invalid format. Supported formats are hex, hsl, and rgba."
        );
    }
  }

  // Helper: Converts HSL to RGB
  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    console.log(s, l);
    // s /= 100; // Convert percentage to 0-1 range
    // l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); // Intermediate value
    const m = l - c / 2; // Match lightness adjustment

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (60 <= h && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (120 <= h && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (180 <= h && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (240 <= h && h < 300) {
      [r, g, b] = [x, 0, c];
    } else if (300 <= h && h < 360) {
      [r, g, b] = [c, 0, x];
    }

    // Convert to [0, 255] range
    const toRgb = (val: number) => Math.round((val + m) * 255);

    return [toRgb(r), toRgb(g), toRgb(b)];
  }

  // Helper: Converts HSL to Hex
  function hslToHex(h: number, s: number, l: number, a: number): string {
    const [r, g, b] = hslToRgb(h, s, l);
    const alphaHex =
      a !== undefined
        ? Math.round(a * 255)
            .toString(16)
            .padStart(2, "0")
        : "ff"; // If alpha is undefined, assume fully opaque
    return `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}${alphaHex}`;
  }

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
        canvasContext.strokeStyle = getColorString(color, "rgba");
        canvasContext.lineWidth = strokeSize;
        canvasContext.lineCap = penStroke.lineCap;
        canvasContext.stroke();
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
    saveCurrentPage();
    isDrawing.current = false;
  };

  const clearScreen = () => {
    if (isCanvasClear()) return;
    saveStateToUndoStack();

    clearCanvas();
  };

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(`Failed to load script: ${src}`);
      document.head.appendChild(script);
    });
  }

  const exportToPDF = async () => {
    if (pages.length === 0) {
      console.error("No pages to export");
      return;
    }

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );

    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF("p", "mm", "a4"); // Portrait, A4 size

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const backgroundColor = "black"; // Set the background color

    // Helper function to load an image as a Promise
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

    // Process pages sequentially
    for (let index = 0; index < pages.length; index++) {
      try {
        const img = await loadImage(pages[index]);

        const imgWidth = img.width;
        const imgHeight = img.height;
        const aspectRatio = imgWidth / imgHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;

        // Scale the image to fit within the PDF while maintaining aspect ratio
        if (aspectRatio > pdfWidth / pdfHeight) {
          finalHeight = finalWidth / aspectRatio;
        } else {
          finalWidth = finalHeight * aspectRatio;
        }

        const xOffset = (pdfWidth - finalWidth) / 2; // Center horizontally
        const yOffset = (pdfHeight - finalHeight) / 2; // Center vertically

        // Add background color
        pdf.setFillColor(backgroundColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F"); // Draw filled rectangle

        // Add the dynamic image on top
        pdf.addImage(
          pages[index],
          "PNG",
          xOffset,
          yOffset,
          finalWidth,
          finalHeight
        );

        // Add a new page, unless it's the last page
        if (index < pages.length - 1) {
          pdf.addPage();
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }

    // Save the PDF after processing all pages
    pdf.save("multi-page.pdf");
  };

  // const exportToPDF = async () => {
  //   if (pages.length === 0) {
  //     console.error("No pages to export");
  //     return;
  //   }

  //   await loadScript(
  //     "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  //   );

  //   const { jsPDF } = (window as any).jspdf;
  //   const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size

  //   const pdfWidth = 210; // A4 width in mm
  //   const pdfHeight = 297; // A4 height in mm

  //   pages.forEach((pageData, index) => {
  //     const img = new Image();
  //     img.src = pageData;

  //     img.onload = () => {
  //       const imgWidth = img.width;
  //       const imgHeight = img.height;
  //       const aspectRatio = imgWidth / imgHeight;

  //       let finalWidth = pdfWidth;
  //       let finalHeight = pdfHeight;

  //       // Scale the image to fit within the PDF while maintaining the aspect ratio
  //       if (aspectRatio > pdfWidth / pdfHeight) {
  //         finalHeight = finalWidth / aspectRatio;
  //       } else {
  //         finalWidth = finalHeight * aspectRatio;
  //       }

  //       const xOffset = (pdfWidth - finalWidth) / 2; // Center horizontally
  //       const yOffset = (pdfHeight - finalHeight) / 2; // Center vertically

  //       // Add the image to the PDF
  //       if (index > 0) pdf.addPage(); // Add new page for all except the first
  //       pdf.addImage(
  //         pageData,
  //         "PNG",
  //         xOffset,
  //         yOffset,
  //         finalWidth,
  //         finalHeight
  //       );

  //       // Save the PDF after processing the last image
  //       if (index === pages.length - 1) {
  //         pdf.save("multi-page.pdf");
  //       }
  //     };
  //   });
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

  return (
    <>
      <DrawerShell
        height={370}
        children={undefined}
        menu={
          <div className=" flex flex-col absolute p-2 items-center justify-center w-full h-fit z-10">
            <div>
              <ColorPicker color={color} setColor={setColor} />
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
            id="myCanvas"
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
        <div className="tools flex p-1 flex-col">
          <div className="row1">
            <Select
              // IconComponent={}
              className="custom-select w-24 p-0 m-0"
              style={{
                border: "none", // Remove border
                outline: "none", // Remove outline
                fontSize: 5,
                padding: 0,
                background: "gray",
              }}
              sx={{
                padding: 0, // Removes the outer padding
                "& .MuiSelect-select": {
                  padding: "0 !important", // Removes the inner padding
                  minHeight: "auto", // Adjusts height to content
                },
                "& fieldset": {
                  border: "none", // Removes the border from outlined variant
                },
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              value={currentPage}
              onChange={(e) => switchPage(+e.target.value)}
            >
              {pages.map((_, index) => (
                <MenuItem
                  key={index}
                  value={index}
                  className="w-full p-0 m-0 select-none"
                  sx={{ padding: 1 }}
                  // style={{ padding: 0 }}
                >
                  <div className="flex justify-between ">
                    <Button
                      style={{ width: "30%", fontSize: 12 }}
                      className="text-sm"
                      variant={index === currentPage ? "contained" : "outlined"}
                      // onClick={() => switchPage(index)}
                    >
                      Page {index + 1}
                    </Button>
                    {index !== currentPage && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deletePage(index);
                        }}
                        sx={{ padding: 0 }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </MenuItem>
              ))}
            </Select>
            <IconButton onClick={addNewPage} sx={{ color: "greenyellow" }}>
              <MdNoteAdd size={25} />
            </IconButton>
            <IconButton
              onClick={() => addPageAtPosition(currentPage)}
              sx={{ color: "green" }}
            >
              <MdAddCard />
              {/* Add before this page */}
            </IconButton>
            <IconButton
              className="tool"
              disabled={undoRedoStack[currentPage].undoStack.length == 0}
              onClick={undo}
              sx={{ color: "#3C6BB2" }}
            >
              <MdOutlineUndo className="tool" size={25} />
            </IconButton>
            <IconButton
              disabled={undoRedoStack[currentPage].redoStack.length == 0}
              onClick={redo}
              sx={{ color: "#3C6BB2" }}
            >
              <MdRedo size={25} />
            </IconButton>

            {/* <Tooltip title="Clear Canvas"> */}
            <IconButton onClick={() => clearScreen()} sx={{ color: "red" }}>
              <CancelPresentationIcon sx={{ rotate: "90deg" }} />
            </IconButton>
            <IconButton
              onClick={() => deletePage(currentPage)}
              sx={{ color: "red" }}
            >
              <MdDelete size={25} />
              {/* Delete this page */}
            </IconButton>
            {/* </Tooltip> */}
          </div>
          <div className="row2">
            <IconButton
              onClick={() => openDrawer()}
              style={{ color: "royalblue" }}
            >
              {/* Color Picker */}
              <ColorLensTwoToneIcon />
            </IconButton>
            {isEraser ? (
              <IconButton sx={{ color: "pink" }} onClick={toggleTool}>
                <MdDraw size={20} />
              </IconButton>
            ) : (
              <IconButton onClick={toggleTool} sx={{ color: "yellow" }}>
                <BsEraserFill size={20} />
              </IconButton>
            )}
            <Select
              className="custom-select "
              style={{
                border: "none", // Remove border
                outline: "none", // Remove outline
                width: 55,
                // height:20
                fontSize: 5,
                background: "gray",
              }}
              sx={{
                padding: 0, // Removes the outer padding
                "& .MuiSelect-select": {
                  display: "flex", // Flex display for content centering
                  alignItems: "center", // Vertical centering
                  justifyContent: "center", // Horizontal centering
                  padding: 1, // Removes the inner padding
                },
                "& fieldset": {
                  border: "none", // Removes the border from outlined variant
                },
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              value={isEraser ? eraserSize / 10 : strokeSize}
              onChange={handleSizeChange}
              renderValue={(val) => {
                return (
                  <div
                    style={{
                      width: val, // Width and height represent the pen size
                      height: val,
                      backgroundColor: "black",
                      borderRadius: "50%", // Makes it look like a pen tip
                    }}
                  ></div>
                );
              }}
            >
              {penSizes.map((size, index) => (
                <MenuItem key={index} value={size}>
                  <div
                    style={{
                      width: size, // Width and height represent the pen size
                      height: size,
                      backgroundColor: "black",
                      borderRadius: "50%", // Makes it look like a pen tip
                    }}
                  ></div>
                </MenuItem>
              ))}
            </Select>
            <IconButton
              onClick={async () => await exportToPDF()}
              sx={{ color: "#32A4DA" }}
            >
              <FileDownloadRoundedIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default DrawingCanvas;
