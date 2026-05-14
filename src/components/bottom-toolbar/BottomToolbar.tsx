import { Select, MenuItem, Button, IconButton } from "@mui/material";
import { BsEraserFill, BsEye } from "react-icons/bs";
import {
  MdNoteAdd,
  MdOutlineUndo,
  MdRedo,
  MdDraw,
  MdSettings,
  MdImage,
  MdCancel,
} from "react-icons/md";
import { penSizes } from "../../constants";
import { ColorPalette, useColorPalette } from "../color-picker/ColorPalette";
import { Dialog } from "@capacitor/dialog";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ColorLensTwoToneIcon from "@mui/icons-material/ColorLensTwoTone";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { useDrawerShell } from "../../services/providers/DrawerShellProvider";
const BottomToolbar = () => {
  const { openDrawer } = useDrawerShell();

  const {
    currentPage,
    pages,
    strokeSize,
    isEraser,
    eraserSize,
    handleSizeChange,
    toggleTool,
    undoRedoStack,
    setUndoRedoStack,
    canvasRef,
    setPages,
    setCurrentPage,
    getCanvasContext,
    clearCanvas,
    saveStateToUndoStack,
    loadPage,
    saveCurrentPage,
    exportToPDF,
    setShowPreview,
    setShowMainMenu,
    setShowImageMenu,
    showImageMenu,
  } = useCanvasDataProvider();
  const { favouriteColorsList, index } = useColorPalette();
  // Save the current canvas state

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
  const clearScreen = async () => {
    const { value } = await Dialog.confirm({
      title: "Clear Screen",
      message: "Are you sure you want to clear the screen?",
      okButtonTitle: "Clear",
      cancelButtonTitle: "Cancel",
    });
    if (!value) return;

    saveStateToUndoStack();
    clearCanvas();
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

  const restoreSnapshot = (snapshot: string) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.src = snapshot;
      img.onload = () => {
        // The context has scale(dpr, dpr) applied persistently.
        // Reset to identity so we can draw at raw physical pixel coords,
        // then restore the DPR scale for subsequent drawing operations.
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to identity
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        // Re-apply DPR scale so normal drawing still works correctly
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
    }
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
  const deletePage = async (pageIndex: number) => {
    // console.log("Deleting page at index:", pageIndex);

    if (pages.length === 1) {
      alert("Ensures at least one page");
      return;
    }

    const { value } = await Dialog.confirm({
      title: "Delete Page",
      message: `Are you sure you want to delete Page ${pageIndex + 1}?`,
      okButtonTitle: "Delete",
      cancelButtonTitle: "Cancel",
    });
    if (!value) return;

    // Calculate updated pages and undoRedoStack **before updating state**
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    const updatedUndoRedoStack = undoRedoStack.filter(
      (_, index) => index !== pageIndex,
    );

    // Determine the new current page safely
    const newPageIndex =
      // Handling edge case when 1st page being deleted
      currentPage >= pageIndex ? Math.max(0, currentPage - 1) : currentPage;
    // console.log("New pages:", updatedPages, "New current page:", newPageIndex);

    // Update states
    setPages(updatedPages);
    setUndoRedoStack(updatedUndoRedoStack);
    setCurrentPage(newPageIndex);

    // Load the new page after state updates
    clearCanvas();
    loadData(updatedPages[newPageIndex]);
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
  // const addPageAtPosition = (position: number) => {
  //   saveStateToUndoStack(); // Save the current page state before modifying

  //   setPages((prevPages: string[]) => {
  //     const newPages = [...prevPages];
  //     newPages.splice(position, 0, ""); // Insert a blank page at the desired position
  //     return newPages;
  //   });

  //   setUndoRedoStack((prevStacks: UndoRedoStack[]) => {
  //     const newStacks = [...prevStacks];
  //     newStacks.splice(position, 0, { undoStack: [], redoStack: [] }); // Add a fresh undo/redo stack
  //     return newStacks;
  //   });

  //   setCurrentPage(position); // Switch to the newly added page
  //   clearCanvas();
  // };
  return (
    <div className="tools flex flex-col p-2 mx-auto bg-gray-900/85 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 min-w-fit mb-2 ">
      {/* Row 1: Page Controls & Canvas Actions */}
      <div className="row1 flex flex-wrap justify-center items-center sm:gap-2">
        <IconButton
          className="tool transition-transform hover:scale-110"
          onClick={() => {
            setShowPreview(true);
          }}
          sx={{ color: "#60A5FA" }} // Light blue
        >
          <BsEye className="tool" size={22} />
        </IconButton>

        <Select
          className="custom-select w-24 p-0 m-0 shadow-inner"
          style={{
            border: "none",
            outline: "none",
            fontSize: 14,
            fontWeight: 500,
            padding: "2px 4px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            borderRadius: 8,
          }}
          sx={{
            padding: 0,
            "& .MuiSelect-select": {
              padding: "0 !important",
              minHeight: "auto",
              display: "flex",
              justifyContent: "center",
            },
            "& fieldset": { border: "none" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                background: "#1f2937", // tailwind gray-800
                color: "white",
              },
            },
          }}
          value={currentPage}
          onChange={(e) => switchPage(+e.target.value)}
        >
          {pages?.map((_, index) => (
            <MenuItem
              key={index}
              value={index}
              className="w-full p-0 m-0 select-none hover:bg-gray-700"
              sx={{ padding: 1 }}
            >
              <div className="flex justify-between items-center w-full">
                <Button className="flex items-center space-x-1 !min-w-[70%] !bg-gray-700 px-3 py-1 !mr-2 !rounded-lg !text-white !normal-case">
                  <span>Page {index + 1}</span>
                </Button>
                {index !== currentPage && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      deletePage(index);
                    }}
                    sx={{ padding: 0, color: "#F87171" }} // Light red
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            </MenuItem>
          ))}
        </Select>

        <IconButton
          onClick={addNewPage}
          className="!text-green-400 transition-transform hover:scale-110"
        >
          <MdNoteAdd size={22} />
        </IconButton>

        <div className="w-px h-6 bg-gray-600 mx-1 hidden sm:block"></div>

        {isEraser ? (
          <IconButton
            className="transition-transform hover:scale-110 bg-gray-800"
            sx={{ color: favouriteColorsList[index] }}
            onClick={toggleTool}
          >
            <MdDraw size={22} />
          </IconButton>
        ) : (
          <IconButton
            onClick={toggleTool}
            sx={{ color: "#FBBF24" }} // Amber
            className="!text-white transition-transform hover:scale-110 bg-gray-800"
          >
            <BsEraserFill size={20} />
          </IconButton>
        )}

        <Select
          className="custom-select !min-h-8 !max-h-8 shadow-inner"
          style={{
            border: "none",
            outline: "none",
            width: 55,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
          }}
          sx={{
            padding: 0,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 1,
            },
            "& fieldset": { border: "none" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 300, background: "#1f2937" }
            }
          }}
          value={isEraser ? eraserSize / 10 : strokeSize}
          onChange={handleSizeChange}
          renderValue={(val) => {
            return (
              <div
                style={{
                  width: val,
                  height: val,
                  backgroundColor: isEraser ? "white" : favouriteColorsList[index] || "white",
                  borderRadius: "50%",
                }}
              ></div>
            );
          }}
        >
          {penSizes.map((size, idx) => (
            <MenuItem key={idx} value={size} className="hover:bg-gray-700 flex justify-center">
              <div
                style={{
                  width: size * 1.5,
                  height: size * 1.5,
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
              ></div>
            </MenuItem>
          ))}
        </Select>

        <IconButton
          onClick={() => clearScreen()}
          className="!text-red-400 transition-transform hover:scale-110"
        >
          <CancelPresentationIcon sx={{ rotate: "90deg", fontSize: 22 }} />
        </IconButton>


        {/* <IconButton
          className="!text-red-400 transition-transform hover:scale-110"
          onClick={() => deletePage(currentPage)}
        >
          <MdDelete size={22} />
        </IconButton> */}

      </div>

      <div className="w-full h-px bg-gray-700/60 my-0.5"></div>

      {/* Row 2: Drawing Tools & Misc */}
      <div className="row2 flex flex-wrap justify-center items-center gap-1 sm:gap-2">

        <IconButton
          className="tool transition-transform hover:scale-110"
          disabled={undoRedoStack[currentPage].undoStack.length === 0}
          onClick={undo}
          sx={{ color: "#60A5FA", "&:disabled": { color: "#4B5563" } }}
        >
          <MdOutlineUndo className="tool" size={22} />
        </IconButton>

        <IconButton
          className="transition-transform hover:scale-110"
          disabled={undoRedoStack[currentPage].redoStack.length === 0}
          onClick={redo}
          sx={{ color: "#60A5FA", "&:disabled": { color: "#4B5563" } }}
        >
          <MdRedo size={22} />
        </IconButton>


        <div className="w-px h-6 bg-gray-600 mx-1 hidden sm:block"></div>

        <ColorPalette />

        <IconButton
          onClick={() => openDrawer()}
          style={{ color: "#818CF8" }}
          className="transition-transform hover:scale-110"
        >
          <ColorLensTwoToneIcon fontSize="small" />
        </IconButton>

        <div className="w-px h-6 bg-gray-600 mx-1 hidden sm:block"></div>
        <IconButton
          onClick={() => setShowImageMenu((prev: boolean) => !prev)}
          sx={{ color: "#E5E7EB" }}
          className="transition-transform hover:scale-110"
        >
          {showImageMenu ? <MdCancel size={22} /> : <MdImage size={22} />}
        </IconButton>
        <IconButton
          onClick={async () => await exportToPDF()}
          sx={{ color: "#38BDF8" }} // Sky blue
          className="transition-transform hover:scale-110"
        >
          <FileDownloadRoundedIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() => setShowMainMenu(true)}
          sx={{ color: "#E5E7EB" }} // Gray-200
          className="transition-transform hover:scale-110"
        >
          <MdSettings size={22} />
        </IconButton>


      </div>
    </div>
  );
};

export default BottomToolbar;
