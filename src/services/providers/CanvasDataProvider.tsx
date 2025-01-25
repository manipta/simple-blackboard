import { createContext, ReactNode, useContext, useRef, useState } from "react";
import { UndoRedoStack } from "../../interfaces/main-canvas/DrawingTool";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Dialog } from "@capacitor/dialog";
import { jsPDF } from "jspdf";
import { Capacitor } from "@capacitor/core";
import { useDialogProvider } from "./DialogProvider";
import { FileOpener } from "@capacitor-community/file-opener";
import SaveDialog from "../../components/dialogs/SaveDialog";
import { useSettings } from "./SettingsProvider";
const CanvasDataContext = createContext({
  pages: [] as string[],
  currentPage: 0,
  strokeSize: 8,
  eraserSize: 80,
  isEraser: false,
  showPreview: false,
  showMainMenu: false,
  undoRedoStack: [{ undoStack: [] as string[], redoStack: [] as string[] }],
  canvasRef: null as unknown as React.MutableRefObject<HTMLCanvasElement>,
  setPages: (([]: string[]) => {}) as React.Dispatch<
    React.SetStateAction<string[]>
  >,
  setCurrentPage: ((_: number) => {}) as React.Dispatch<
    React.SetStateAction<number>
  >,
  setStrokeSize: ((_: number) => {}) as React.Dispatch<
    React.SetStateAction<number>
  >,
  setEraserSize: ((_: number) => {}) as React.Dispatch<
    React.SetStateAction<number>
  >,
  setIsEraser: ((_: boolean) => {}) as React.Dispatch<
    React.SetStateAction<boolean>
  >,
  setShowPreview: ((_: boolean) => {}) as React.Dispatch<
    React.SetStateAction<boolean>
  >,
  setShowMainMenu: ((_: boolean) => {}) as React.Dispatch<
    React.SetStateAction<boolean>
  >,
  isCanvasClear: () => false as boolean,
  handleSizeChange: (_: any) => {},
  getCanvasContext: () => null as CanvasRenderingContext2D | null,
  setUndoRedoStack: ((_: UndoRedoStack[]) => []) as React.Dispatch<
    React.SetStateAction<UndoRedoStack[]>
  >,
  clearCanvas: () => {},
  loadPage: (_: number) => {},
  resetCanvas: () => {},
  toggleTool: () => {},
  exportToPDF: () => {},
  saveCurrentPage: () => {},
  saveStateToUndoStack: () => {},
});

// function loadScript(src: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src = src;
//     script.async = true;
//     script.onload = () => resolve();
//     script.onerror = () => reject(`Failed to load script: ${src}`);
//     document.head.appendChild(script);
//   });
// }

const CanvasDataProvider = ({ children }: { children: ReactNode }) => {
  const { openDialog } = useDialogProvider();
  const { defaultSavePath } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(
    null as unknown as HTMLCanvasElement
  );
  const [pages, setPages] = useState<string[]>([]); // Store canvas data as Base64
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [strokeSize, setStrokeSize] = useState(8);
  const [eraserSize, setEraserSize] = useState(80);
  const [isEraser, setIsEraser] = useState(false); // Tracks if eraser is selected

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMainMenu, setShowMainMenu] = useState<boolean>(false);
  // State with a default color (HSL with Alpha)
  const [undoRedoStack, setUndoRedoStack] = useState<UndoRedoStack[]>([
    { undoStack: [], redoStack: [] },
  ]);
  const handleSizeChange = (e: any) => {
    isEraser
      ? setEraserSize(e.target.value * 10)
      : setStrokeSize(e.target.value);
  };
  const toggleTool = () => {
    setIsEraser(!isEraser);
  };
  const getCanvasContext = () => canvasRef.current?.getContext("2d");
  const isCanvasClear = () => {
    const ctx = getCanvasContext();
    if (!ctx) return false;
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
  };
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
    loadPage(currentPage);
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
  const exportToPDF = async () => {
    if (pages.length === 0) {
      console.error("No pages to export");
      return;
    }
    openDialog(
      <SaveDialog saveFunction={mainSaveFunction}></SaveDialog>,
      "Save the Pdf"
    );
    // here
    // const { cancelled } = await Dialog.prompt({
    //   title: "Save the Pdf",
    //   message: `Enter the File name`,
    //   inputText: formatTimestamp(),
    //   okButtonTitle: "Save",
    // });
    // if (cancelled) return;
  };
  const mainSaveFunction = async (bgColor: string, fileName: string) => {
    // try {
    //   await loadScript(
    //     "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    //   );
    // } catch (_) {
    //   console.error(_, "Not able to load script");
    // }

    // const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF("p", "mm", "a4"); // Portrait, A4 size

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const backgroundColor = bgColor ?? "black"; // Set the background color

    // Helper function to load an image as a Promise
    const loadImage = async (src: string): Promise<HTMLImageElement> => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        console.log("Attempting to load base64 image.");

        img.onload = () => {
          console.log("Base64 image loaded successfully.");
          resolve(img);
        };

        img.onerror = (error) => {
          console.error("Failed to load base64 image:", error);
          reject(new Error("Failed to load base64 image."));
        };
        console.log(src);

        img.src = src; // Directly set the base64 string
      });
    };

    // Process pages sequentially
    for (let index = 0; index < pages.length; index++) {
      try {
        const img = await loadImage(pages[index]);
        console.log(img);
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
        pdf.addImage(img, "PNG", xOffset, yOffset, finalWidth, finalHeight);

        // Add a new page, unless it's the last page
        if (index < pages.length - 1) {
          pdf.addPage();
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
    if (Capacitor.getPlatform() === "web")
      // Save the PDF after processing all pages
      // if (Capacitor.getPlatform() === "web") {
      //   pdf.save(value);
      // } else {
      // Mobile: Save the file to the device
      pdf.save(`${fileName}.pdf`);
    else {
      try {
        const { files } = await Filesystem.readdir({
          path: defaultSavePath,
          directory: Directory.Documents,
        });

        const fileNames = files?.map((f) => f?.name);
        if (fileNames?.includes(`${fileName}.pdf`)) {
          const { value } = await Dialog.confirm({
            message: "File exists. Do you want to overwrite?",
            okButtonTitle: "Yes, I want to overwrite it",
            cancelButtonTitle: "No",
            title: "File Exists!",
          });
          if (!value) return;
        }
      } catch (e) {
        console.log("Path doesn't Exists", e);
      }
      const pdfBlob = pdf.output("blob");
      //   const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64Data = await convertBlobToBase64(pdfBlob);
      try {
        const result = await Filesystem.writeFile({
          path: `${defaultSavePath}/${fileName}.pdf`,
          data: base64Data,
          directory: Directory.Documents,
          // encoding: Encoding.,
          recursive: true,
        });
        alert(
          `PDF saved successfully to /Documents/${defaultSavePath}/${fileName}.pdf`
        );
        await FileOpener.open({
          filePath: result.uri,
          contentType: "application/pdf",
        });

        console.log("File opened successfully");
      } catch (error) {
        alert(`Sorry,Not able to save!`);
        console.error("Error writing PDF to filesystem:", error);
      }
    }
  };
  // writeSecretFile();
  // Utility function to convert Blob to Base64
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]); // Get only the Base64 part
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <CanvasDataContext.Provider
      value={{
        pages,
        setPages,
        currentPage,
        setCurrentPage,
        eraserSize,
        isEraser,
        setEraserSize,
        setIsEraser,
        setStrokeSize,
        strokeSize,
        handleSizeChange,
        setUndoRedoStack,
        undoRedoStack,
        canvasRef,
        toggleTool,
        getCanvasContext,
        isCanvasClear,
        clearCanvas,
        resetCanvas,
        saveStateToUndoStack,
        loadPage,
        saveCurrentPage,
        exportToPDF,
        showPreview,
        setShowPreview,
        showMainMenu,
        setShowMainMenu,
      }}
    >
      {children}
    </CanvasDataContext.Provider>
  );
};

const useCanvasDataProvider = () => {
  const context = useContext(CanvasDataContext);
  return context;
};

export { useCanvasDataProvider, CanvasDataProvider };
