import React from "react";
import { HSLColor, SketchPicker } from "react-color";
import { Color } from "../../interfaces/main-canvas/DrawingTool";

interface ColorPickerProps {
  color: Color;
  setColor: React.Dispatch<React.SetStateAction<Color>>;
}

const ColorPicker = ({ color, setColor }: ColorPickerProps) => {
  // Convert custom color to HSLA format for SketchPicker
  const hslaColor = {
    h: color.hue,
    s: color.saturation,
    l: color.luminosity,
    a: color.alpha,
  };

  // Update state when color changes
  const handleColorChange = (newColor: HSLColor) => {
    if (newColor) {
      const { h, s, l, a } = newColor;
      setColor({
        hue: h,
        saturation: s,
        luminosity: l,
        alpha: a,
      });
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <SketchPicker
        color={hslaColor}
        onChange={(e) => handleColorChange(e.hsl)}
      />
      <div style={{ marginTop: "1rem" }}>
        <p>
          Selected Color: HSLA(
          {color.hue.toFixed(0)}, {(color.saturation * 100).toFixed(0)}%,{" "}
          {(color.luminosity * 100).toFixed(0)}%, {color.alpha.toFixed(2)})
        </p>
      </div>
    </div>
  );
};

export default ColorPicker;
