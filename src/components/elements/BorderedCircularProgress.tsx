import Box from "@mui/material/Box";
import CircularProgress, {
  circularProgressClasses,
  type CircularProgressProps,
} from "@mui/material/CircularProgress";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

export default function BorderedCircularProgress(
  props: CircularProgressProps & { value: number; label: string }
) {
  return (
    <Box sx={{ position: "relative" }}>
      <CircularProgress
        variant="determinate"
        sx={{
          position: "absolute",
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
        }}
        {...props}
        value={100}
      />
      <CircularProgressWithLabel
        sx={{
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        {...props}
        label={props.label}
        value={props.value}
      />
    </Box>
  );
}
