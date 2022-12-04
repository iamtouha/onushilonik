// create context for shifting light and dark mode
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

type ColorMode = "dark" | "light" | "auto" | null;

const ColorModeContext = createContext<
  ["light" | "dark", (mode: ColorMode) => void, ColorMode]
>(["light", () => undefined, "auto"]);

export default ColorModeContext;

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [colorMode, setColorMode] = useState<ColorMode | null>(null);

  const mode = useMemo(() => {
    if (colorMode === "auto" || !colorMode) {
      return prefersDarkMode ? "dark" : "light";
    }
    return colorMode;
  }, [prefersDarkMode, colorMode]);

  useEffect(() => {
    const savedMode = localStorage.getItem("color-mode") as ColorMode | null;
    if (savedMode) {
      setColorMode(savedMode);
      return;
    }
    setColorMode("auto");
  }, []);
  useEffect(() => {
    if (colorMode) {
      localStorage.setItem("color-mode", colorMode);
    }
  }, [colorMode]);

  return (
    <ColorModeContext.Provider value={[mode, setColorMode, colorMode]}>
      {children}
    </ColorModeContext.Provider>
  );
};
