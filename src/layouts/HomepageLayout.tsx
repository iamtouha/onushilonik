import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NextLink from "next/link";
type Props = { children: ReactNode };

function HomepageLayout(props: Props) {
  const { children } = props;

  return (
    <>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <Typography variant="h5" color={"primary"}>
            অনুশীলনিক
          </Typography>
          <Box sx={{ mr: 2, ml: "auto" }}>
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
      <Toolbar />
      <Box>{children}</Box>
    </>
  );
}

export default HomepageLayout;
