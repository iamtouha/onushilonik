import { useState, useContext } from "react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import LaunchIcon from "@mui/icons-material/Launch";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ColorModeContext from "@/contexts/ColorModeContext";
import AdminNavGuard from "@/components/AdminNavGuard";
import ColorModeToggle from "@/components/ColormodeToggle";

type Props = { children: React.ReactNode };

function DashboardLayout({ children }: Props) {
  const [mode, toggleColorMode] = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { data: session } = useSession();

  return (
    <AdminNavGuard>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <Typography variant="h5" color="primary">
            অনুশীলনিক
          </Typography>

          <Box sx={{ ml: "auto", mr: 0 }} />
          <NextLink href={"/"} passHref>
            <Button
              component="a"
              target={"_blank"}
              sx={{ mr: { xs: 1, md: 4 } }}
            >
              website
              <LaunchIcon sx={{ ml: 1 }} />
            </Button>
          </NextLink>

          <Box>
            <IconButton
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              {session?.user?.image ? (
                <Avatar
                  src={session.user.image}
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <Avatar {...stringAvatar(session?.user?.name ?? "Admin")} />
              )}
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <List sx={{ py: 0 }}>
                <ListItem sx={{ mt: 0 }}>
                  <ListItemText
                    primary={session?.user?.name}
                    secondary={session?.user?.email ?? ""}
                  />
                </ListItem>
              </List>
              <Box
                sx={{ display: "flex", justifyContent: "center", my: 1, px: 1 }}
              >
                <ColorModeToggle />
              </Box>
              <Divider />
              <NextLink href={"/api/auth/signout"} passHref>
                <MenuItem component="a" sx={{ mt: 1 }}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </NextLink>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Box component={"main"}>{children}</Box>
    </AdminNavGuard>
  );
}

export default DashboardLayout;

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  const [firstName, lastName] = name.split(" ");
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`,
  };
}
