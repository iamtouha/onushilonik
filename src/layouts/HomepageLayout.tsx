import { type ReactNode, useContext, cloneElement } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NextLink from "next/link";
import IconButton from "@mui/material/IconButton";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ColorModeContext from "@/contexts/ColorModeContext";

interface ElevationProps {
  window?: () => Window;
  children: React.ReactElement;
}

function ElevationScroll(props: ElevationProps) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

type Props = { children: ReactNode };

function HomepageLayout(props: Props) {
  const [mode, toggleColorMode] = useContext(ColorModeContext);
  return (
    <>
      <ElevationScroll {...props}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <NextLink href="/" passHref>
              <Typography
                variant="h5"
                component="a"
                sx={{ textDecoration: "none" }}
                color={"primary"}
              >
                অনুশীলনিক
              </Typography>
            </NextLink>
            <Box sx={{ mr: 2, ml: "auto" }}>
              <IconButton
                sx={{ mr: 1 }}
                onClick={() => toggleColorMode()}
                color="inherit"
              >
                {mode === "dark" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
              <NextLink href={"/app"} passHref>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component="a"
                >
                  এখনই শুরু কর
                </Button>
              </NextLink>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Toolbar />
      <Box>{props.children}</Box>
    </>
  );
}

export default HomepageLayout;
