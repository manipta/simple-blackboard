import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import RouteBackdrop from "../components/ui/RouteBackdrop";
import Error404Component from "../components/ui/Error404Component";
import DrawingCanvas from "../components/main-canvas/DrawingCanvas";
import { ColorPaletteProvider } from "../components/color-picker/ColorPalette";
const FreeUserRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteBackdrop />}>
              <ColorPaletteProvider>
                <DrawingCanvas />
              </ColorPaletteProvider>
            </Suspense>
          }
        >
          <Route path="*" element={<Error404Component />} />
        </Route>
      </Routes>
    </>
  );
};

export default FreeUserRoutes;
