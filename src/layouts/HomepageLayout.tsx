import { type ReactNode, useMemo, useContext, cloneElement } from "react";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NextLink from "next/link";
import { trpc } from "@/utils/trpc";
import { SUBSCRIPTION_STATUS } from "@prisma/client";
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
  const { data: session } = useSession();
  const { data: subscription } = trpc.useQuery(["subscription.get"], {
    enabled: !!session?.user,
  });

  const startLink = useMemo(() => {
    if (subscription?.status === SUBSCRIPTION_STATUS.ACTIVE) {
      return "/app";
    }
    return "/app/subscribe";
  }, [subscription?.status]);
  return (
    <>
      <ElevationScroll {...props}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <Typography variant="h5" color={"primary"}>
              অনুশীলনিক
            </Typography>
            <Box sx={{ mr: 2, ml: "auto" }}>
              <IconButton
                sx={{ mr: 1 }}
                onClick={() => toggleColorMode()}
                color="inherit"
              >
                {mode === "dark" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
              <NextLink href={startLink} passHref>
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
