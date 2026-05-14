import { useState, useEffect, useRef } from "react";
import { useSettings } from "../../services/providers/SettingsProvider";
import { MdClose, MdPictureAsPdf, MdColorLens } from "react-icons/md";
import { Icon } from "@mui/material";
import { CirclePicker, SketchPicker } from "react-color";

const formatTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

const SaveDialog = ({ saveFunction, closeDialog }: any) => {
  const { boardConfig } = useSettings();
  const [fileName, setFileName] = useState(formatTimestamp());
  const [bgColor, setBgColor] = useState(
    boardConfig.type === "color" ? boardConfig.board : "#000000",
  );
  const [showPicker, setShowPicker] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleSave = () => {
    saveFunction(bgColor, fileName);
    closeDialog();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60] p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-6 w-full max-w-sm transform transition-all">

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <MdPictureAsPdf size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-100">Export PDF</h2>
          </div>
          <Icon
            onClick={closeDialog}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <MdClose size={24} />
          </Icon>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">File Name</label>
            <div className="relative">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition-all pr-10"
                placeholder="Enter file name"
              />
              {fileName && (
                <Icon
                  onClick={() => setFileName("")}
                  className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <MdClose size={18} />
                </Icon>
              )}
            </div>
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Background Color</label>
            <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 flex flex-col gap-4 shadow-inner">
              <div className="flex justify-center">
                <CirclePicker
                  color={bgColor}
                  onChange={(color) => setBgColor(color.hex)}
                  circleSize={24}
                  circleSpacing={12}
                  colors={[
                    "#FFFFFF",
                    "#274C43", "#000000"
                  ]}
                />
              </div>

              <div
                className="flex items-center gap-3 bg-gray-900/80 border border-gray-700/80 rounded-xl px-3 py-2 transition-colors hover:border-blue-500/50 cursor-pointer relative"
                onClick={() => setShowPicker(true)}
              >
                <MdColorLens className="text-gray-400" size={18} />
                <span className="w-full bg-transparent text-gray-200 text-sm font-mono uppercase select-none">
                  {bgColor}
                </span>
                <div
                  className="w-6 h-6 rounded-lg border border-gray-600/50 shadow-sm"
                  style={{ backgroundColor: bgColor }}
                />

                {showPicker && (
                  <div
                    ref={popoverRef}
                    className="absolute bottom-full right-0 mb-3 z-[70] sketch-picker-custom bg-gray-800/95 p-3 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl w-64"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SketchPicker
                      color={bgColor}
                      onChange={(color) => setBgColor(color.hex)}
                      disableAlpha={true}
                      presetColors={[]}
                      width="100%"
                      styles={{
                        default: {
                          picker: { background: "transparent", boxShadow: "none", padding: 0 },
                          activeColor: { height: 16, borderRadius: "8px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" },
                          hue: { height: 16, borderRadius: "8px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" },
                          color: { borderRadius: "8px" }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={closeDialog}
              className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-800 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-bold"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
