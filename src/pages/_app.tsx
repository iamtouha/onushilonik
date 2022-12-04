import type { NextPage } from "next";
import { useMemo, useContext } from "react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import orange from "@mui/material/colors/orange";
import { ToastContainer } from "react-toastify";
import type { ReactElement, ReactNode, FunctionComponent } from "react";
import type { AppProps } from "next/app";
import DefaultLayout from "../layouts/DefaultLayout";
import ColorModeContext, {
  ColorModeProvider,
} from "../contexts/ColorModeContext";
import "../styles/globals.css";

import "react-toastify/dist/ReactToastify.css";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};

const MuiTheme = ({ children }: { children: ReactNode }) => {
  const [mode] = useContext(ColorModeContext);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: orange[600],
          },
        },
        components: {
          MuiCard: {
            defaultProps: {
              variant: mode === "dark" ? "elevation" : "outlined",
            },
          },
        },
      }),
    [mode]
  );
  return (
    <ThemeProvider theme={theme}>
      {children}
      <CssBaseline />
    </ThemeProvider>
  );
};
function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <SessionProvider session={pageProps.session}>
      <ColorModeProvider>
        <MuiTheme>{getLayout(<Component {...pageProps} />)}</MuiTheme>
      </ColorModeProvider>
      <ToastContainer />
    </SessionProvider>
  );
}

export default trpc.withTRPC(MyApp);
