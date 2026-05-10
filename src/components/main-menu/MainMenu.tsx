import { Switch, TextField, Tooltip } from "@mui/material";
import { APP_NAME, boardColors } from "../../constants";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import "./MainMenu.scss";
import { useSettings } from "../../services/providers/SettingsProvider";
import BgColorChoice from "./BgColorChoice";
import { MdChevronLeft, MdChevronRight, MdInfoOutline } from "react-icons/md";
import { useState } from "react";
import AdFreeTimer from "./AdFreeTimer";
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
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((prevState) => !prevState);
  };
  return (
    <div
      className="w-full h-full flex flex-col gap-8"
      onClick={() => {
        if (open) setOpen(false);
      }}
    >
      <div className="flex text-4xl bg-black ">
        <div
          className="text-center content-center relative left-4 "
          onClick={() => setShowMainMenu(false)}
        >
          <MdChevronLeft size={50} />
        </div>
        <div className=" w-full flex justify-center items-center text-center p-4">
          {APP_NAME}
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center p-2 px-8 menu-item">
          <div>Chalk Effect</div>
          <Switch
            checked={chalkEffect}
            onChange={(e) => {
              setChalkEffect(e.target.checked);
            }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "darkgreen", // change the color when checked
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "green", // change track color when checked
              },
            }}
          ></Switch>
        </div>
        <div className="flex justify-between items-center p-2 px-8 menu-item">
          <div>Chalk/Duster Animation</div>
          <Switch
            checked={chalkAnimation}
            onChange={(e) => {
              setChalkAnimation(e.target.checked);
            }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "darkgreen", // change the color when checked
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "green", // change track color when checked
              },
            }}
          ></Switch>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-col justify-between p-2 px-8 menu-item">
          <div>Save Location</div>
          <div className="text-sm font-extrabold text-black flex items-center gap-1">
            /Documents/
            <TextField
              defaultValue={defaultSavePath}
              onChange={(e) => {
                if (e.target.value && e.target.value != "") {
                  setDefaultSavePath(e.target.value);
                }
              }}
              inputProps={{
                style: {
                  background: "white",
                  borderRadius: "4px",
                  padding: "2px",
                },
              }}
            ></TextField>
            /{"<FILE_NAME>.pdf"}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-col justify-between p-2 px-8 menu-item">
          <div>Board Colors</div>
          <div className="flex gap-2 justify-evenly w-full h-full mt-2">
            {boardColors.map((board) => (
              <div className="text-sm font-semibold text-stone-700 flex items-center gap-1">
                <BgColorChoice
                  board={board.board}
                  type={board.type}
                  title={board.title}
                  check={
                    boardConfig.type == board.type &&
                    boardConfig.board == board.board
                  }
                  setBoardConfig={setBoardConfig}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      /** 
       <div className="flex flex-col w-full">
        <div className="flex flex-col items-center p-2 px-8 menu-item w-full">
          <div className="flex justify-between items-center w-full">
            <div>Ad-Free Timer</div>
            <Tooltip
              title={"Pre-Watch Ads to get ad-free time!"}
              open={open}
              disableHoverListener
              >
              <div onClick={handleClick}>
                <MdInfoOutline size={25} />
              </div>
            </Tooltip>
          </div>
          <div className="w-full text-lg">
            <AdFreeTimer />
          </div>
        </div>
      </div> */
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center p-2 px-8 menu-item">
          <div>Feedback</div>
          <div>
            <MdChevronRight size={40} />
          </div>
        </div>
        <div className="flex justify-between items-center p-2 px-8 menu-item">
          <div>About Me</div>
          <div>
            <MdChevronRight size={40} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
