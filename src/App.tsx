import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { DialogProvider } from "./services/providers/DialogProvider";
import AppRoutes from "./routes/AppRoutes";
import { DrawerShellProvider } from "./services/providers/DrawerShellProvider";

import { StatusBar } from "@capacitor/status-bar";
import { useEffect } from "react";
import { CanvasDataProvider } from "./services/providers/CanvasDataProvider";
import { SettingsProvider } from "./services/providers/SettingsProvider";
function App() {
  useEffect(() => {
    const enableFullscreen = async () => {
      // Hide the status bar
      await StatusBar.hide();

      // Optionally set the status bar style
      // await StatusBar.setStyle({ style: "LIGHT" });
    };

    enableFullscreen();
  }, []);
  return (
    <div className="h-screen w-full flex flex-col">
      <BrowserRouter>
        <SettingsProvider>
          <DialogProvider>
            <CanvasDataProvider>
              <DrawerShellProvider>
                <div className="relative ">
                  <AppRoutes />
                </div>
              </DrawerShellProvider>
            </CanvasDataProvider>
          </DialogProvider>
        </SettingsProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
