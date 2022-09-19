import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
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
import ListItemButton from "@mui/material/ListItemButton";
import Drawer from "@mui/material/Drawer";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LaunchIcon from "@mui/icons-material/Launch";

import AdminNavGuard from "@/components/AdminNavGuard";

const routes = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Categories", href: "/dashboard/categories" },
  { title: "Products", href: "/dashboard/products" },
  { title: "Photos", href: "/dashboard/photos" },
  { title: "Orders", href: "/dashboard/orders" },
  { title: "Customers", href: "/dashboard/customers" },
];

const DrawerContent = () => {
  return (
    <Box>
      <Box>
        <List>
          {routes.map((route) => (
            <ListItem key={route.href}>
              <NextLink href={route.href} passHref>
                <ListItemButton component="a">
                  <ListItemText primary={route.title} />
                </ListItemButton>
              </NextLink>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

type Props = { children: React.ReactNode; window?: () => Window };

function DashboardLayout(props: Props) {
  const { window, children } = props;
  const title = "Dashboard";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { data: session } = useSession();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <AdminNavGuard>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <Typography variant="h5"> {title} </Typography>
          <Box sx={{ display: { xs: "none", md: "block" }, ml: 4 }}>
            {routes.map((route) => (
              <NextLink key={route.href} href={route.href} passHref>
                <Button
                  component="a"
                  disabled={router.pathname === route.href}
                  sx={{ textTransform: "none" }}
                >
                  {route.title}
                </Button>
              </NextLink>
            ))}
          </Box>
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

          <Box sx={{ display: { xs: "none", md: "block" } }}>
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
              <Divider />
              <NextLink href={"/api/auth/signout"} passHref>
                <MenuItem component="a" sx={{ mt: 1 }}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </NextLink>
            </Menu>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="nav">
        <Drawer
          container={container}
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 250,
            },
          }}
        >
          <ListItem>
            <IconButton sx={{ ml: "auto" }} onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </ListItem>
          <Divider />
          <DrawerContent />
          <Divider />
          <List>
            <ListItem sx={{ display: { md: "none" } }}>
              <ListItemAvatar>
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
              </ListItemAvatar>
              <ListItemText
                primary={session?.user?.name ?? "Admin"}
                secondary={session?.user?.email ?? ""}
              ></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemButton
                onClick={() => {
                  signOut();
                }}
              >
                <LogoutIcon sx={{ mr: 1 }} />
                Sign Out
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </Box>
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
