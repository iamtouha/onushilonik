import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
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
    <ButtonGroup variant="outlined" disableElevation size="small">
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
