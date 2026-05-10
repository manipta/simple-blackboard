import { createContext, useState, useContext, ReactNode } from "react";
import { STORAGE_FOLDER_NAME } from "../../constants";
import { BoardColorConfig } from "../../components/main-menu/MainMenu";
import { chalkDusterTheme } from "../../game-theme/chalk-duster/chalk-duster-theme";

// Create a context with a default value (it could be empty or contain default settings)
const SettingsContext = createContext({
  chalkEffect: false,
  setChalkEffect: ((_: boolean) => {}) as React.Dispatch<
    React.SetStateAction<boolean>
  >,
  chalkAnimation: true,
  setChalkAnimation: ((_: boolean) => {}) as React.Dispatch<
    React.SetStateAction<boolean>
  >,
  defaultSavePath: STORAGE_FOLDER_NAME,
  setDefaultSavePath: ((_: string) => {}) as React.Dispatch<
    React.SetStateAction<string>
  >,
  boardConfig: {} as BoardColorConfig,
  setBoardConfig: ((_: BoardColorConfig) => {}) as React.Dispatch<
    React.SetStateAction<BoardColorConfig>
  >,
});

// The SettingsProvider component to wrap around your app or part of it
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Define some state that holds your settings (this could be an object with user preferences, etc.)
  const [chalkEffect, setChalkEffect] = useState(true);
  const [chalkAnimation, setChalkAnimation] = useState(true);
  const [defaultSavePath, setDefaultSavePath] = useState<string>(
    `${STORAGE_FOLDER_NAME}`
  );
  const [boardConfig, setBoardConfig] = useState<BoardColorConfig>({
    board: chalkDusterTheme.board,
    title: "Black Board",
    type: "image",
  });

  return (
    <SettingsContext.Provider
      value={{
        chalkEffect,
        setChalkEffect,
        chalkAnimation,
        setChalkAnimation,
        defaultSavePath,
        setDefaultSavePath,
        boardConfig,
        setBoardConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
export const useSettings = () => {
  return useContext(SettingsContext);
};
