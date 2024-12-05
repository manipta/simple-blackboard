import { Navigate, Route, Routes } from "react-router-dom";

import { UserType } from "../constants";
import AuthenticatedRoutes from "./Authenticated";
import UnAuthenticatedRoutes from "./UnAuthenticated";

const AppRoutes = () => {
  const userType = UserType.FreeUser;
  const isAuthenticated = true;
  //   const { isAuthenticated, setAuthentication } = useAuth();
  // Only scenario, this can be null is when user is loggedOut or in case
  // of old user.
  //   const userType = StorageHelper.getUserInfo()?.type || UserType.Student;
  //   const setAuthStateDelegate = (isAuthenticated: boolean) => {
  //     setAuthentication(isAuthenticated);
  //   };

  //   useEffect(() => {
  //     httpService.setupAuthDelegate(setAuthStateDelegate);
  //   }, []);
  return (
    <Routes>
      <Route
        path="/*"
        element={
          !isAuthenticated ? <UnAuthenticatedRoutes /> : <Navigate to="/" />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <AuthenticatedRoutes userType={userType} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
