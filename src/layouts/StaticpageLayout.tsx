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
import { useSession } from "next-auth/react";
import Footer from "@/components/Footer";

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

function StaticpageLayout(props: Props) {
  const { data: session, status } = useSession();
  const [mode, toggleColorMode] = useContext(ColorModeContext);
  return (
    <>
      <ElevationScroll {...props}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <NextLink href="/">
              <Typography
                variant="h5"
                sx={{ textDecoration: "none" }}
                color={"primary"}
              >
                অনুশীলনিক
              </Typography>
            </NextLink>
            <Box sx={{ mr: 2, ml: "auto" }}>
              <IconButton
                sx={{ mr: 1 }}
                onClick={() =>
                  toggleColorMode(mode === "dark" ? "light" : "dark")
                }
                color="inherit"
              >
                {mode === "dark" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
              <NextLink href={session ? "/app" : "/api/auth/signin"}>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={status === "loading"}
                  color="primary"
                  size="large"
                >
                  {session ? "Open App" : "Sign In"}
                </Button>
              </NextLink>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Box sx={{ minHeight: "100vh" }}>
        <Toolbar />
        {props.children}
      </Box>
      <Footer />
    </>
  );
}

export default StaticpageLayout;
