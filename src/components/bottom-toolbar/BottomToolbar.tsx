import { Select, MenuItem, Button, IconButton } from "@mui/material";
import { BsEraserFill, BsEye } from "react-icons/bs";
import {
  MdNoteAdd,
  MdAddCard,
  MdOutlineUndo,
  MdRedo,
  MdDelete,
  MdDraw,
  MdMenu,
  MdImage,
  MdCancel,
} from "react-icons/md";
import { penSizes } from "../../constants";
import { ColorPalette, useColorPalette } from "../color-picker/ColorPalette";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ColorLensTwoToneIcon from "@mui/icons-material/ColorLensTwoTone";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { UndoRedoStack } from "../../interfaces/main-canvas/DrawingTool";
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
    isCanvasClear,
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
  const clearScreen = () => {
    if (isCanvasClear()) return;
    saveStateToUndoStack();

    clearCanvas();
    saveCurrentPage();
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
  const addPageAtPosition = (position: number) => {
    saveStateToUndoStack(); // Save the current page state before modifying

    setPages((prevPages: string[]) => {
      const newPages = [...prevPages];
      newPages.splice(position, 0, ""); // Insert a blank page at the desired position
      return newPages;
    });

    setUndoRedoStack((prevStacks: UndoRedoStack[]) => {
      const newStacks = [...prevStacks];
      newStacks.splice(position, 0, { undoStack: [], redoStack: [] }); // Add a fresh undo/redo stack
      return newStacks;
    });

    setCurrentPage(position); // Switch to the newly added page
    clearCanvas();
  };
  return (
    <div className="tools flex p-1 flex-col">
      <div className="row1 flex flex-wrap justify-center items-center">
        <IconButton
          className="tool"
          onClick={() => {
            setShowPreview(true);
          }}
          sx={{ color: "#3C6BB2" }}
        >
          <BsEye className="tool" size={25} />
        </IconButton>
        <Select
          // IconComponent={}
          className="custom-select w-24 p-0 m-0 "
          style={{
            border: "none", // Remove border
            outline: "none", // Remove outline
            fontSize: 5,
            padding: 1,
            background: "gray",
            borderRadius: 8,
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
            "& .MuiSelect-icon": {
              right: 0,
              // padding: 2, // Adjust this value as needed (e.g., 8px)
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                margin: "8",
                background: "gray",
                paddingInlineEnd: 1,
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
              className="w-full p-0 m-0 select-none "
              sx={{ padding: 1 }}
              // style={{ padding: 0 }}
            >
              <div className="flex justify-between ">
                <Button
                  className="flex items-center space-x-1 !min-w-[80%] !max-w-[80%] !bg-gray-700 px-3 py-2 !mr-2 !rounded-lg !text-white"
                  // style={{ width: "30%", fontSize: 12 }}
                  // className="text-sm"
                  // variant={index === currentPage ? "contained" : "outlined"}
                  // onClick={() => switchPage(index)}
                >
                  <span>Page {index + 1}</span>
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
        <IconButton
          onClick={addNewPage}
          // sx={{ color: "greenyellow" }}
          className="!text-green-400"
        >
          <MdNoteAdd size={25} />
        </IconButton>
        <IconButton
          onClick={() => addPageAtPosition(currentPage)}
          // sx={{ color: "green" }}
          className="!text-green-400"
        >
          <MdAddCard />
          {/* Add before this page */}
        </IconButton>
        <IconButton
          className="tool"
          disabled={undoRedoStack[currentPage].undoStack.length == 0}
          onClick={undo}
          sx={{ color: "#3C6BB2", "&:disabled": { color: "gray" } }}
        >
          <MdOutlineUndo className="tool" size={25} />
        </IconButton>
        <IconButton
          disabled={undoRedoStack[currentPage].redoStack.length == 0}
          onClick={redo}
          sx={{ color: "#3C6BB2", "&:disabled": { color: "gray" } }}
        >
          <MdRedo size={25} />
        </IconButton>

        {/* <Tooltip title="Clear Canvas"> */}
        <IconButton
          onClick={() => clearScreen()}
          className="!text-red-400"
          // sx={{ color: "red" }}
        >
          <CancelPresentationIcon sx={{ rotate: "90deg" }} />
        </IconButton>
        <IconButton
          className="!text-red-400"
          onClick={() => deletePage(currentPage)}
          // sx={{ color: "red" }}
        >
          <MdDelete size={25} />
          {/* Delete this page */}
        </IconButton>
        {/* </Tooltip> */}
      </div>
      <div className="row2 flex flex-wrap justify-center items-center">
        {isEraser ? (
          <IconButton
            sx={{ color: favouriteColorsList[index] }}
            onClick={toggleTool}
          >
            <MdDraw size={20} />
          </IconButton>
        ) : (
          <IconButton
            onClick={toggleTool}
            sx={{ color: "yellow" }}
            className="!text-white"
          >
            <BsEraserFill size={20} />
          </IconButton>
        )}
        <Select
          className="custom-select !min-h-8 !max-h-8"
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
                  borderRadius: "75%", // Makes it look like a pen tip
                }}
              ></div>
            );
          }}
        >
          {penSizes.map((size, index) => (
            <MenuItem key={index} value={size}>
              <div
                style={{
                  width: size * 1.5, // Width and height represent the pen size
                  height: size * 1.5,
                  backgroundColor: "black",
                  borderRadius: "75%", // Makes it look like a pen tip
                }}
              ></div>
            </MenuItem>
          ))}
        </Select>
        <ColorPalette />
        <IconButton onClick={() => openDrawer()} style={{ color: "royalblue" }}>
          {/* Color Picker */}
          <ColorLensTwoToneIcon />
        </IconButton>
        <IconButton
          onClick={async () => await exportToPDF()}
          sx={{ color: "#32A4DA" }}
        >
          <FileDownloadRoundedIcon />
        </IconButton>
        <IconButton
          onClick={() => setShowMainMenu(true)}
          sx={{ color: "ButtonFace" }}
        >
          <MdMenu />
        </IconButton>
        <IconButton
          onClick={() => {
            setShowImageMenu((prev: boolean) => !prev); // Function form
          }}
          sx={{ color: "ButtonFace" }}
        >
          {showImageMenu ? <MdCancel /> : <MdImage />}
        </IconButton>
      </div>
    </div>
  );
};

export default BottomToolbar;
