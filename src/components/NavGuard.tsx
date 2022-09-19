import Box from "@mui/material/Box";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type Props = {
  children: ReactNode;
};

function NavGuard({ children }: Props) {
  const { status } = useSession({ required: true });

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={50} />
          <Typography variant="h6">loading...</Typography>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}

export default NavGuard;
