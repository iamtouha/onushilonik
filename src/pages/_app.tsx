import superjson from "superjson";
import { useMemo, useContext } from "react";
import type { NextPage } from "next";
import { withTRPC } from "@trpc/next";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { SessionProvider } from "next-auth/react";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import orange from "@mui/material/colors/orange";
import { ToastContainer } from "react-toastify";
import type { ReactElement, ReactNode, FunctionComponent } from "react";
import type { AppProps } from "next/app";
import type { AppRouter } from "../server/router";
import DefaultLayout from "../layouts/DefaultLayout";
import ColorModeContext, {
  ColorModeProvider,
} from "../contexts/ColorModeContext";

import "react-toastify/dist/ReactToastify.css";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
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
            main: orange[500],
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

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default withTRPC<AppRouter>({
  config() {
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({ url }),
      ],
      url,
      transformer: superjson,
    };
  },

  ssr: false,
})(MyApp as FunctionComponent<AppPropsWithLayout>);
