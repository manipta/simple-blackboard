import { useState, useRef, useEffect } from "react";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import { loadImage } from "./DrawingCanvasService";

const DraggableImage = ({
  src,
  onDelete,
  img,
  canvasWidth,
  canvasHeight,
}: any) => {
  const { getCanvasContext, canvasRef } = useCanvasDataProvider();
  const context = getCanvasContext();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: img.width, height: img.height });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    (async () => {
      let newImage = await loadImage(src);
      let largerRatio = 1;
      if (canvasRef.current.width * 0.9 < newImage.naturalWidth * dpr) {
        largerRatio = parseInt(
          (
            (newImage.naturalWidth * dpr) /
            (canvasRef.current.width * 0.9)
          ).toFixed(0)
        );
      }
      if (canvasRef.current.height * 0.9 < newImage.naturalHeight * dpr) {
        largerRatio = Math.max(
          largerRatio,
          parseInt(
            (
              (newImage.naturalHeight * dpr) /
              (canvasRef.current.height * 0.9)
            ).toFixed(0)
          )
        );
      }
      setSize({
        width: (newImage.naturalWidth * dpr) / largerRatio,
        height: (newImage.naturalHeight * dpr) / largerRatio,
      });
    })();
  }, []);

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
    const minWidth = 20;
    const minHeight = 20;

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

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", userSelect: "none" }}
        draggable={false}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 10,
          height: 10,
          background: "red",
          cursor: "nwse-resize",
        }}
        onMouseDown={() => setResizing(true)}
        onTouchStart={() => setResizing(true)}
      ></div>
      <button
        style={{ position: "absolute", top: -20, left: 0 }}
        onClick={drawImage}
      >
        ✅
      </button>
      <button
        style={{ position: "absolute", top: -20, right: 0 }}
        onClick={onDelete}
      >
        ❌
      </button>
    </div>
  );
};

const Canvas = ({ width, height }: any) => {
  const [images, setImages] = useState<any>([]);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImages([...images, { id: Date.now(), src: reader.result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: width,
        height: height,
        border: "1px solid black",
      }}
    >
      <input type="file" onChange={handleImageUpload} />
      {images.map((img: any) => (
        <DraggableImage
          key={img.id}
          src={img.src}
          img={img}
          canvasWidth={width}
          canvasHeight={height}
          onDelete={() => setImages(images.filter((i: any) => i.id !== img.id))}
        />
      ))}
    </div>
  );
};

export default Canvas;
