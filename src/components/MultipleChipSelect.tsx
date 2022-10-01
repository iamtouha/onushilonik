import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";

type SelectProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(code: string, selected: string[], theme: Theme) {
  return {
    fontWeight:
      selected.indexOf(code) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelectChip(props: SelectProps) {
  const theme = useTheme();
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    props.onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <FormControl disabled={props.disabled} fullWidth sx={{ m: 1 }}>
      <InputLabel id="demo-multiple-chip-label">{props.label}</InputLabel>
      <Select
        id="demo-multiple-chip"
        multiple
        value={props.selected}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label={props.label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {props.options.map((code) => (
          <MenuItem
            key={code}
            value={code}
            style={getStyles(code, props.selected, theme)}
          >
            {code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
