import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { DialogProvider } from "./services/providers/DialogProvider";
import AppRoutes from "./routes/AppRoutes";
import { DrawerShellProvider } from "./services/providers/DrawerShellProvider";

function App() {
  return (
    <div className="h-screen w-full flex flex-col">
      <BrowserRouter>
        <DialogProvider>
          <DrawerShellProvider>
            <div className="relative ">
              <AppRoutes />
            </div>
          </DrawerShellProvider>
        </DialogProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
