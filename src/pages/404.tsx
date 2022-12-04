import Box from "@mui/material/Box";
import { type NextPageWithLayout } from "./_app";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import NextLink from "next/link";
import HomeIcon from "@mui/icons-material/Home";

const Four0Four: NextPageWithLayout = () => {
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <ListItem sx={{ maxWidth: 400 }}>
        <ListItemAvatar sx={{ py: 2, pr: 2 }}>
          <Avatar
            sx={{
              width: 85,
              height: 85,
              p: 2,
              fontSize: 40,
            }}
          >
            404
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={<Typography variant="h5">Page Not Found !</Typography>}
          secondary={
            <NextLink href={"/"}>
              <Button color="primary" sx={{ textTransform: "none", mt: 1 }}>
                <HomeIcon sx={{ mr: 1 }} /> Home Page
              </Button>
            </NextLink>
          }
        />
      </ListItem>
    </Box>
  );
};

Four0Four.getLayout = (page) => <>{page}</>;

export default Four0Four;
