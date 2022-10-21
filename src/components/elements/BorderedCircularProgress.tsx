import Box from "@mui/material/Box";
import CircularProgress, {
  circularProgressClasses,
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

export default function BorderedCircularProgress(
  props: CircularProgressProps & { value: number }
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
        disableShrink
        sx={{
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        {...props}
        value={props.value}
      />
    </Box>
  );
}
