import { createContext, ReactNode, useContext, useState } from "react";
import { defaultColorPalette } from "../../constants";

const ColorPaletteContext = createContext({
  favouriteColorsList: defaultColorPalette as string[],
  index: 0 as number,
  setFavouriteColorsList: ((_: string[]) => { }) as React.Dispatch<
    React.SetStateAction<string[]>
  >,
  setIndex: (_: number) => { },
  handleColorChange: (_: string) => { },
});
export const ColorPalette = () => {
  const { favouriteColorsList, index, setIndex } = useColorPalette();
  // console.log(favouriteColorsList);
  return (
    <div className="flex items-center justify-center">
      {favouriteColorsList.map((color, i) => (
        <div
          key={i}
          onClick={() => setIndex(i)} /* Handle circle click */
          style={{
            display: "inline-block",
            width: i == index ? "17px" : "20px",
            height: i == index ? "17px" : "20px",
            borderRadius: "50%",
            backgroundColor: color,
            margin: "0 5px",
            cursor: "pointer",
            border: i == index ? "2px solid gray" : "none",
          }}
        />
      ))}
    </div>
  );
};
export const ColorPaletteProvider = ({ children }: { children: ReactNode }) => {
  const [index, setIndex] = useState<number>(0);
  const [favouriteColorsList, setFavouriteColorsList] =
    useState<string[]>(defaultColorPalette);
  const handleColorChange = (newColor: string) => {
    if (newColor) {
      setFavouriteColorsList((prev) => {
        return prev.map((c, i) => {
          if (i == index) {
            return newColor;
          } else return c;
        });
      });
    }
  };
  return (
    <ColorPaletteContext.Provider
      value={{
        favouriteColorsList,
        setFavouriteColorsList,
        index,
        setIndex,
        handleColorChange,
      }}
    >
      {children}
    </ColorPaletteContext.Provider>
  );
};

export const useColorPalette = () => {
  return useContext(ColorPaletteContext);
};
