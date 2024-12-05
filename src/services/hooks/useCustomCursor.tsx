import { useState, useEffect } from "react";

const useCustomCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        setCursorPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    // Add event listeners for both mouse and touch movements
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchMove);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
    };
  }, []);

  return cursorPosition;
};

export default useCustomCursor;
