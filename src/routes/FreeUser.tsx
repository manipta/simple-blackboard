import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import RouteBackdrop from "../components/ui/RouteBackdrop";
import Error404Component from "../components/ui/Error404Component";
import DrawingCanvas from "../components/main-canvas/DrawingCanvas";
const FreeUserRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteBackdrop />}>
              <DrawingCanvas />
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
