import { Icon, Switch, TextField } from "@mui/material";
import { boardColors } from "../../constants";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import { useSettings } from "../../services/providers/SettingsProvider";
import { useAdsSettings } from "../../services/providers/AdsSettingsProvider";
import BgColorChoice from "./BgColorChoice";
import { MdChevronLeft, MdChevronRight, MdSettings, MdColorLens, MdFolder, MdStar, MdApps } from "react-icons/md";
import { useState, useEffect } from "react";

export interface BoardColorConfig {
  board: string;
  type: "image" | "color";
  title: string;
}

const MainMenu = () => {
  const { setShowMainMenu } = useCanvasDataProvider();
  const {
    setChalkEffect,
    chalkEffect,
    chalkAnimation,
    setChalkAnimation,
    defaultSavePath,
    setDefaultSavePath,
    boardConfig,
    setBoardConfig,
  } = useSettings();
  const { adFreeTimeLeft, cooldownTimeLeft, showRewardedAd, setForceHideBanner } = useAdsSettings();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setForceHideBanner(true);
    return () => setForceHideBanner(false);
  }, [setForceHideBanner]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    return `${s}s`;
  };

  return (
    <div
      className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 flex flex-col items-center overflow-y-auto pb-12 font-sans"
      onClick={() => {
        if (open) setOpen(false);
      }}
    >
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between p-6 sticky top-0 backdrop-blur-xl z-10 border-b border-gray-800">
        <Icon className="text-gray-300" onClick={() => setShowMainMenu(false)}>
          <MdChevronLeft size={32} />
        </Icon>
        <h1 className="flex items-center justify-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          Settings
        </h1>
        <div className="w-10 h-10"></div> {/* Spacer to center title */}
      </div>

      <div className="w-full max-w-2xl px-4 mt-6 flex flex-col gap-6">

        {/* Section: Preferences */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
          <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-700/50 bg-gray-800/80">
            <MdSettings className="text-blue-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-200">Drawing Preferences</h2>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center p-4 px-6 border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
              <div>
                <div className="font-medium text-gray-200">Chalk Effect</div>
                <div className="text-sm text-gray-400">Enable realistic chalk texture</div>
              </div>
              <Switch
                checked={chalkEffect}
                onChange={(e) => setChalkEffect(e.target.checked)}
                color="primary"
              />
            </div>
            <div className="flex justify-between items-center p-4 px-6 hover:bg-gray-700/20 transition-colors">
              <div>
                <div className="font-medium text-gray-200">Tool Animations</div>
                <div className="text-sm text-gray-400">Show chalk and duster animations</div>
              </div>
              <Switch
                checked={chalkAnimation}
                onChange={(e) => setChalkAnimation(e.target.checked)}
                color="primary"
              />
            </div>
          </div>
        </div>

        {/* Section: Configuration */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg">
          <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-700/50 bg-gray-800/80">
            <MdFolder className="text-indigo-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-200">Configuration</h2>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-3 p-4 px-6 border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
              <div>
                <div className="font-medium text-gray-200">Save Location</div>
                <div className="text-sm text-gray-400">Directory to export your boards</div>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-gray-700">
                <span className="text-gray-400 pl-2">/Documents/</span>
                <TextField
                  defaultValue={defaultSavePath}
                  variant="standard"
                  onChange={(e) => {
                    if (e.target.value && e.target.value !== "") {
                      setDefaultSavePath(e.target.value);
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    style: { color: "white", padding: "0 4px", fontSize: "14px" }
                  }}
                  className="bg-gray-800 rounded px-2 py-1 flex-1 text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 px-6 hover:bg-gray-700/20 transition-colors">
              <div className="flex items-center gap-2">
                <MdColorLens className="text-gray-400" size={20} />
                <div className="font-medium text-gray-200">Board Background</div>
              </div>
              <div className="flex flex-wrap gap-4 justify-evenly mt-2 p-2 bg-gray-900/50 rounded-xl">
                {boardColors.map((board) => (
                  <div key={board.title} className="flex flex-col items-center gap-2 transform transition-transform hover:scale-105">
                    <BgColorChoice
                      board={board.board}
                      type={board.type}
                      title={board.title}
                      check={boardConfig.type === board.type && boardConfig.board === board.board}
                      setBoardConfig={setBoardConfig}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Premium & Extras */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden shadow-lg mt-2">
          <div className="flex flex-col">
            <div
              className={`flex justify-between items-center p-5 px-6 border-b border-gray-700/30 transition-all group ${
                cooldownTimeLeft > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700/40 cursor-pointer"
              }`}
              onClick={() => {
                if (cooldownTimeLeft === 0) showRewardedAd();
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-amber-500/20 text-amber-400 rounded-xl ${cooldownTimeLeft === 0 ? "group-hover:scale-110" : ""} transition-transform`}>
                  <MdStar size={28} />
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-400">Unlock Premium</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Watch a short ad for 10 mins of ad-free drawing!
                    {adFreeTimeLeft > 0 && (
                      <span className="ml-1 text-amber-300 font-semibold block sm:inline">
                        (Ad-free: {formatTime(adFreeTimeLeft)})
                      </span>
                    )}
                    {cooldownTimeLeft > 0 && (
                      <span className="ml-1 text-red-400 font-semibold block sm:inline">
                        (Wait: {formatTime(cooldownTimeLeft)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <MdChevronRight size={32} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>

            <div
              className="flex justify-between items-center p-5 px-6 hover:bg-gray-700/40 cursor-pointer transition-all group"
              onClick={() => window.open("https://www.secretnotes.in", "_blank")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <MdApps size={28} />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-200">More Apps by Maniware</div>
                  <div className="text-sm text-gray-400 mt-1">Discover other great tools and utilities</div>
                </div>
              </div>
              <MdChevronRight size={32} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <button
          onClick={() => setShowMainMenu(false)}
          className="mt-6 w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          Back to Canvas
        </button>

      </div>
    </div>
  );
};

export default MainMenu;
