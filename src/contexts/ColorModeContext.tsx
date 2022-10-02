// create context for shifting light and dark mode
import { createContext, useState, ReactNode, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

const ColorModeContext = createContext<["light" | "dark", () => void]>([
  "light",
  () => {},
]);

export default ColorModeContext;

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">(
    prefersDarkMode ? "dark" : "light"
  );
  useEffect(() => {
    setMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider value={[mode, toggleColorMode]}>
      {children}
    </ColorModeContext.Provider>
  );
};
