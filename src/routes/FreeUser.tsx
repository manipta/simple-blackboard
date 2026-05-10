import { Route, Routes } from "react-router-dom";
// "@dotlottie/react-player": "^1.6.19",
import Error404Component from "../components/ui/Error404Component";
import DrawingCanvas from "../components/main-canvas/DrawingCanvas";
const FreeUserRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DrawingCanvas />}>
          <Route path="*" element={<Error404Component />} />
        </Route>
      </Routes>
    </>
  );
};

export default FreeUserRoutes;
