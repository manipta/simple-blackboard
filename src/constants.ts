import { BoardColorConfig } from "./components/main-menu/MainMenu";
import { chalkDusterTheme } from "./game-theme/chalk-duster/chalk-duster-theme";
export const enum LocalStorageKeys {
  USER_INFO = "USER_INFO",
  CANVAS_DATA = "CANVAS_DATA",
  UNDO_REDO_STACK = "UNDO_REDO_STACK",
  ERASER_SIZE = "ERASER_SIZE",
  STROKE_SIZE = "STROKE_SIZE",
  CURRENT_PAGE = "CURRENT_PAGE",
  DEFAULT_SAVE_PATH = "DEFAULT_SAVE_PATH",
  COLOR_PALETTE = "COLOR_PALETTE",
  BOARD_CONFIG = "BOARD_CONFIG",
  CHALK_EFFECT_AND_ANIMATION = "CHALK_EFFECT_AND_ANIMATION",
}

export enum UserType {
  FreeUser = "free-user",
  AdFreeUser = "ad-free-user",
  Premium = "premium-user",
}

export const APP_NAME = "Drawing Canvas";
export const STORAGE_FOLDER_NAME = APP_NAME ?? "SimpleBlackBoard";

export const REWARD_AD_FREE_TIME_SECONDS = 300; // 5 minutes
export const ADMOB_REWARDED_AD_ID = "ca-app-pub-3940256099942544/5224354917"; // Google Test ID
export const ADMOB_BANNER_AD_ID = "ca-app-pub-3940256099942544/6300978111"; // Google Test ID

export const penSizes = [2, 4, 8, 12, 16]; // Pen sizes in pixels

export const boardColors: BoardColorConfig[] = [
  {
    board: "#FFFFFF",
    title: "White",
    type: "color",
  },
  {
    board: "#274C43",
    title: "Green",
    type: "color",
  },
  {
    board: chalkDusterTheme.board,
    title: "Black",
    type: "image",
  },
];

export const defaultColorPalette = [
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
];
