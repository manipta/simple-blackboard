import { HSLColor, SketchPicker } from "react-color";
import { ColorPalette, useColorPalette } from "./ColorPalette";

function getColorString(
  color: HSLColor,
  format: "hex" | "hsl" | "rgba"
): string {
  const { h, s, l, a } = color;

  switch (format) {
    case "hex":
      return hslToHex(h, s, l, a || 1);

    case "hsl":
      return `hsl(${h}, ${s}%, ${l}%)`;

    case "rgba":
      const [r, g, b] = hslToRgb(h, s, l);
      return `rgba(${r}, ${g}, ${b}, ${Math.round((a || 1) * 100) / 100})`;

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

const ColorPicker = () => {
  const { index, handleColorChange, favouriteColorsList } = useColorPalette();
  // Update state when color changes

  return (
    <div style={{ textAlign: "center" }}>
      <SketchPicker
        width="250px"
        styles={{
          default: {
            activeColor: { height: 14 },
            hue: { height: 30 },
          },
        }}
        presetColors={[]}
        disableAlpha={true}
        color={favouriteColorsList[index]}
        onChange={(e) => handleColorChange(getColorString(e.hsl, "rgba"))}
      />
      <div style={{ marginTop: "1rem" }}>
        {/* Quick Access Circle Colors */}
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "#f0f0f0",
            border: "2px solid #ccc",
          }}
          className="rounded-md"
        >
          <p className="text-md">Color Palette</p>
          <ColorPalette />
        </div>
        {/* <p>Selected Color: {color}</p> */}
      </div>
    </div>
  );
};

export default ColorPicker;
