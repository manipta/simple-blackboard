import { useState, useRef, useEffect } from "react";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import { loadImage } from "./DrawingCanvasService";
import { MdCheck, MdClose } from "react-icons/md";

const DraggableImage = ({
  src,
  onDelete,
  canvasWidth,
  canvasHeight,
}: any) => {
  const { getCanvasContext, canvasRef } = useCanvasDataProvider();
  const context = getCanvasContext();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    (async () => {
      let newImage = await loadImage(src);
      let largerRatio = 1;
      if (canvasWidth * 0.9 < newImage.naturalWidth) {
        largerRatio = newImage.naturalWidth / (canvasWidth * 0.9);
      }
      if (canvasHeight * 0.9 < newImage.naturalHeight) {
        largerRatio = Math.max(
          largerRatio,
          newImage.naturalHeight / (canvasHeight * 0.9)
        );
      }
      setSize({
        width: newImage.naturalWidth / largerRatio,
        height: newImage.naturalHeight / largerRatio,
      });
      setLoaded(true);
    })();
  }, [src, canvasWidth, canvasHeight]);

  const drawImage = async () => {
    let newImage = await loadImage(src);
    context?.drawImage(
      newImage,
      position.x,
      position.y,
      size.width,
      size.height
    );
  };

  const lastPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    lastPosition.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const handleTouchStart = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    lastPosition.current = { x: touch.clientX, y: touch.clientY };
    setDragging(true);
  };

  const constrainPosition = (newX: number, newY: number) => {
    // Constrain x position
    const minX = 0;
    const maxX = canvasWidth - size.width;
    const boundedX = Math.max(minX, Math.min(maxX, newX));

    // Constrain y position
    const minY = 0;
    const maxY = canvasHeight - size.height;
    const boundedY = Math.max(minY, Math.min(maxY, newY));

    return { x: boundedX, y: boundedY };
  };

  const constrainSize = (newWidth: number, newHeight: number) => {
    // Ensure minimum size
    const minWidth = 40;
    const minHeight = 40;

    // Ensure size doesn't exceed canvas boundaries
    const maxWidth = canvasWidth - position.x;
    const maxHeight = canvasHeight - position.y;

    const boundedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    const boundedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    return { width: boundedWidth, height: boundedHeight };
  };

  const handleMouseMove = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragging && !resizing) {
      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;

      const newPosition = constrainPosition(
        position.x + deltaX,
        position.y + deltaY
      );

      setPosition(newPosition);
      lastPosition.current = { x: e.clientX, y: e.clientY };
    }

    if (resizing) {
      const newSize = constrainSize(
        e.clientX - position.x,
        e.clientY - position.y
      );
      setSize(newSize);
    }
  };

  const handleTouchMove = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragging && !resizing) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPosition.current.x;
      const deltaY = touch.clientY - lastPosition.current.y;

      const newPosition = constrainPosition(
        position.x + deltaX,
        position.y + deltaY
      );

      setPosition(newPosition);
      lastPosition.current = { x: touch.clientX, y: touch.clientY };
    }

    if (resizing) {
      const touch = e.touches[0];
      const newSize = constrainSize(
        touch.clientX - position.x,
        touch.clientY - position.y
      );
      setSize(newSize);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setResizing(false);
  };

  if (!loaded) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: dragging ? "grabbing" : "grab",
        border: "2px dashed rgba(255, 255, 255, 0.4)",
        boxSizing: "border-box",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="z-20 rounded-md bg-white/5 backdrop-blur-[2px]"
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", userSelect: "none" }}
        draggable={false}
        className="rounded-md object-contain pointer-events-none"
      />
      <div
        className="absolute bottom-[-8px] right-[-8px] w-5 h-5 bg-[#3b82f6] rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-30 transition-transform hover:scale-110 active:scale-95"
        onMouseDown={(e) => { e.stopPropagation(); setResizing(true); }}
        onTouchStart={(e) => { e.stopPropagation(); setResizing(true); }}
      ></div>
      <div className="absolute -top-16 right-0 flex gap-3 z-30">
        <button
          className="flex items-center justify-center w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full text-white shadow-lg transition-transform hover:scale-110"
          onClick={(e) => { e.stopPropagation(); onDelete(false); }}
        >
          <MdClose size={32} />
        </button>
        <button
          className="flex items-center justify-center w-14 h-14 bg-green-500/80 hover:bg-green-400 backdrop-blur-md border border-green-300/50 rounded-full text-white shadow-lg transition-transform hover:scale-110"
          onClick={async (e) => { e.stopPropagation(); await drawImage(); onDelete(true); }}
        >
          <MdCheck size={32} />
        </button>
      </div>
    </div>
  );
};

const Canvas = ({ width, height }: any) => {
  const [images, setImages] = useState<any>([]);
  const { setShowImageMenu, saveStateToUndoStack } = useCanvasDataProvider();
  const hasTriggeredPicker = useRef(false);

  useEffect(() => {
    // Auto trigger file picker when mounted and no images are present
    if (images.length === 0 && !hasTriggeredPicker.current) {
      hasTriggeredPicker.current = true;
      document.getElementById('hidden-image-input')?.click();
    }
  }, []);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImages([...images, { id: Date.now(), src: reader.result }]);
      };
      reader.readAsDataURL(file);
    } else {
      // If user cancelled, they can click image icon again or we can auto-close
      if (images.length === 0) {
        setShowImageMenu(false);
      }
    }
    // reset input so same file can be chosen again
    event.target.value = null;
  };

  return (
    <div
      style={{
        position: "absolute",
        width: width,
        height: height,
        pointerEvents: images.length > 0 ? "auto" : "none",
        zIndex: images.length > 0 ? 10 : -1,
      }}
    >
      <input
        id="hidden-image-input"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      {images.map((img: any) => (
        <DraggableImage
          key={img.id}
          src={img.src}
          img={img}
          canvasWidth={width}
          canvasHeight={height}
          onDelete={(stamped: boolean) => {
            if (stamped) {
              saveStateToUndoStack(); // Save state after drawing image
            }
            setImages(images.filter((i: any) => i.id !== img.id));
            if (stamped) {
              setShowImageMenu(false); // Auto close menu after resolving the image
            }
          }}
        />
      ))}
    </div>
  );
};

export default Canvas;
