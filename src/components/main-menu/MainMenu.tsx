import { Switch, TextField } from "@mui/material";
import { APP_NAME } from "../../constants";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import "./MainMenu.scss";
import { useSettings } from "../../services/providers/SettingsProvider";
const MainMenu = () => {
  const { setShowMainMenu } = useCanvasDataProvider();
  const {
    setChalkEffect,
    chalkEffect,
    chalkAnimation,
    setChalkAnimation,
    defaultSavePath,
    setDefaultSavePath,
  } = useSettings();
  return (
    <div className="w-full">
      <div className="flex text-4xl bg-black">
        <div
          className="text-center content-center relative left-4 "
          onClick={() => setShowMainMenu(false)}
        >
          {"<"}
        </div>
        <div className=" w-full text-center p-4">{APP_NAME}</div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center p-2 px-8 menu-item">
          <div>Chalk Effect</div>
          <Switch
            checked={chalkEffect}
            onChange={(e) => {
              setChalkEffect(e.target.checked);
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
          ></Switch>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-col justify-between p-2 px-8 menu-item">
          <div>Save Location</div>
          <div className="text-sm font-semibold text-stone-700 flex items-center gap-1">
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
    </div>
  );
};

export default MainMenu;
