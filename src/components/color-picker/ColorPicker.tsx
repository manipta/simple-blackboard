import { HSLColor, SketchPicker } from "react-color";
import { ColorPalette, useColorPalette } from "./ColorPalette";
import { MdRestartAlt } from "react-icons/md";
import { defaultColorPalette } from "../../constants";

function getColorString(
  color: HSLColor,
  format: "hex" | "hsl" | "rgba",
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
        "Invalid format. Supported formats are hex, hsl, and rgba.",
      );
  }
}

// Helper: Converts HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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
  const {
    index,
    handleColorChange,
    favouriteColorsList,
    setFavouriteColorsList,
  } = useColorPalette();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[280px] px-2 pb-4">
      {/* Custom CSS to perfectly theme the SketchPicker internals */}
      <style>{`
        .sketch-picker-custom {
          width: 100% !important;
        }
        .sketch-picker-custom input {
          background-color: rgba(31, 41, 55, 0.8) !important;
          color: #F3F4F6 !important;
          border-radius: 8px !important;
          border: 1px solid rgba(75, 85, 99, 0.6) !important;
          box-shadow: none !important;
          padding: 6px 4px !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 13px !important;
          transition: border-color 0.2s ease;
        }
        .sketch-picker-custom input:focus {
          border-color: #60A5FA !important;
          outline: none !important;
        }
        .sketch-picker-custom span {
          color: #9CA3AF !important;
          font-weight: 500 !important;
          padding-top: 6px !important;
          text-transform: uppercase;
          font-size: 11px !important;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="sketch-picker-custom bg-gray-800/60 p-4 rounded-3xl shadow-inner border border-gray-700/50 w-full flex justify-center">
        <SketchPicker
          width="100%"
          styles={{
            default: {
              picker: {
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              },
              activeColor: {
                height: 12,
                borderRadius: "5px",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
              },
              hue: {
                height: 18,
                borderRadius: "10px",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
              },
              color: {
                borderRadius: "10px",
              }
            },
          }}
          presetColors={[]}
          disableAlpha={true}
          color={favouriteColorsList[index]}
          onChange={(e) => handleColorChange(getColorString(e.hsl, "rgba"))}
        />
      </div>

      <div className="w-full mt-5 bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 shadow-lg relative text-gray-200 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Quick Palette</p>
          <div
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 cursor-pointer transition-colors px-2.5 py-1.5 bg-red-500/10 rounded-xl font-medium"
            onClick={() => {
              setFavouriteColorsList(defaultColorPalette);
            }}
          >
            <MdRestartAlt size={16} />
            <span>Reset</span>
          </div>
        </div>
        <div className="flex justify-center mt-1">
          <ColorPalette />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
