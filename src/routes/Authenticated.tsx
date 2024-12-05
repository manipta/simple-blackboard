import { UserType } from "../constants";
import FreeUser from "./FreeUser";

const AuthenticatedRoutes = ({ userType }: { [key: string]: UserType }) => {
  return (
    <>
      {userType == UserType.FreeUser && <FreeUser />}
      {userType === UserType.AdFreeUser && <FreeUser />}
      {userType == UserType.Premium && <FreeUser />}
    </>
  );
};

export default AuthenticatedRoutes;
