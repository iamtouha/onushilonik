import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ColorModeContext from "@/contexts/ColorModeContext";

const options: {
  text: string;
  icon: React.ReactElement;
  key: "auto" | "dark" | "light";
}[] = [
  { key: "auto", icon: <BrightnessAutoIcon />, text: "system" },
  { key: "dark", icon: <Brightness4Icon />, text: "dark" },
  { key: "light", icon: <Brightness7Icon />, text: "light" },
];

export default function ColorModeToggle() {
  const [mode, setMode, colorMode] = React.useContext(ColorModeContext);

  return (
    <ButtonGroup
      aria-label={mode + " mode toggle"}
      variant="outlined"
      disableElevation
      size="small"
    >
      {options.map((option) => (
        <Button
          key={option.key}
          disabled={option.key === colorMode}
          onClick={() => setMode(option.key)}
        >
          {option.text}
        </Button>
      ))}
    </ButtonGroup>
  );
}
