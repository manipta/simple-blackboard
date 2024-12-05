import { createContext, useState, ReactNode, useContext } from "react";
import { chalkDusterTheme } from "../game-theme/chalk-duster/chalk-duster-theme";
import { Theme } from "../interfaces/main-canvas/DrawingTool";

// Create context for Theme
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: chalkDusterTheme, setTheme: () => {} });

// Theme Provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(chalkDusterTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the Theme Context
export const useTheme = () => useContext(ThemeContext);
