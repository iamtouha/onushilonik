import Box from "@mui/material/Box";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import EngineeringIcon from "@mui/icons-material/Engineering";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NextLink from "next/link";
import { USER_ROLE as ROLE } from "@prisma/client";

type Props = {
  children: ReactNode;
};

function AdminNavGuard({ children }: Props) {
  const { data: session, status } = useSession({ required: true });

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
  if (
    session.user?.role === ROLE.ADMIN ||
    session.user?.role === ROLE.SUPER_ADMIN
  ) {
    return <>{children}</>;
  }
  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <EngineeringIcon sx={{ fontSize: 80 }} />
        <Typography variant="h6">Admin users only</Typography>
        <NextLink href={"/"} passHref>
          <Button component={"a"} sx={{ mt: 2 }}>
            <ArrowBackIcon sx={{ mr: 1 }} />
            Home page
          </Button>
        </NextLink>
      </Box>
    </Box>
  );
}

export default AdminNavGuard;
