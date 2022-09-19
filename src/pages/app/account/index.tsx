import Box from "@mui/material/Box";
import { useSession } from "next-auth/react";

function Account() {
  const { data: session, status } = useSession();
  return (
    <>
      <Box>account</Box>

      {status}
    </>
  );
}

export default Account;
