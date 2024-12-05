import { createContext, ReactNode, useContext, useState } from "react";

interface DrawerShellContextProps {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerShellContext = createContext<DrawerShellContextProps | undefined>(
  undefined
);

export const DrawerShellProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <DrawerShellContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerShellContext.Provider>
  );
};

export const useDrawerShell = () => {
  const context = useContext(DrawerShellContext);
  if (!context) {
    throw new Error("useDrawerShell must be used within a DrawerShellProvider");
  }
  return context;
};
