import { useState, useEffect } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SpeedIcon from "@mui/icons-material/Speed";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import ColorModeToggle from "@/components/ColorModeToggle";

const routes = [
  { title: "Home", href: "/app" },
  { title: "Question Bank", href: "/app/question-bank" },
  { title: "Previous year questions", href: "/app/prev-questions" },
  { title: "Model Test", href: "/app/model-tests" },
  { title: "Short Notes", href: "/app/short-notes" },
];

const DrawerContent = () => {
  return (
    <Box>
      <Box>
        <List>
          {routes.map((route) => (
            <ListItem key={route.href}>
              <NextLink href={route.href}>
                <ListItemButton>{route.title}</ListItemButton>
              </NextLink>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

type Props = { children: React.ReactNode; window?: () => Window };

function DefaultLayout(props: Props) {
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });
  const { window, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (session?.user?.id && !session.user.profileId) {
      router.push("/create-profile");
    }
  }, [session?.user?.profileId, session?.user?.id]);

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
  if (!session) {
    return <Typography>not logged in</Typography>;
  }
  if (!session.user?.active) {
    return (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <WarningIcon color="error" sx={{ fontSize: 80 }} />
          <Typography variant="h5" gutterBottom>
            আপনার একাউন্টটি নিষ্ক্রিয় করা হয়েছে
          </Typography>
          <Typography variant="body2" gutterBottom>
            আপনার একাউন্টটি নিষ্ক্রিয় করা হয়েছে, অনুগ্রহ করে একাউন্ট সম্পর্কিত
            সমস্যা সমাধানের জন্য আমাদের সাথে যোগাযোগ করুন
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => signOut()}
          >
            সাইন আউট
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="fixed" color="default">
        <Toolbar>
          <NextLink href="/">
            <Typography
              variant="h5"
              sx={{ textDecoration: "none" }}
              color={"primary"}
            >
              অনুশীলনিক
            </Typography>
          </NextLink>
          <Box sx={{ display: { xs: "none", md: "flex" }, ml: 4 }}>
            {routes.map((route) => (
              <NextLink key={route.href} href={route.href}>
                <Button
                  sx={{
                    color:
                      router.pathname === route.href ? "primary" : "inherit",
                    display: "block",
                  }}
                >
                  {route.title}
                </Button>
              </NextLink>
            ))}
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" }, ml: "auto", mr: 2 }}>
            <IconButton
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              {session.user?.image ? (
                <Avatar
                  src={session.user.image}
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <Avatar {...stringAvatar(session?.user?.name ?? "User")} />
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
              <NextLink href="/app/account">
                <ListItem button sx={{ mt: 0 }}>
                  <ListItemText
                    primary={session.user?.name}
                    secondary={session.user?.email ?? ""}
                  />
                </ListItem>
              </NextLink>

              <Box
                sx={{ display: "flex", justifyContent: "center", my: 1, px: 1 }}
              >
                <ColorModeToggle />
              </Box>

              {session?.user?.role.includes("ADMIN") && (
                <NextLink href="/dashboard">
                  <MenuItem sx={{ mt: 1 }}>
                    <SpeedIcon sx={{ mr: 1 }} />
                    Dashboard
                  </MenuItem>
                </NextLink>
              )}
              <NextLink href={"/api/auth/signout"}>
                <MenuItem>
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
            sx={{ mr: 2, ml: "auto", display: { md: "none" } }}
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
            <NextLink href="/app/account">
              <ListItem button sx={{ display: { md: "none" } }}>
                <>
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
                      <Avatar
                        {...stringAvatar(session?.user?.name ?? "User")}
                      />
                    )}
                  </ListItemAvatar>
                </>

                <ListItemText
                  primary={session?.user?.name ?? "User"}
                  secondary={session?.user?.email ?? ""}
                ></ListItemText>
              </ListItem>
            </NextLink>
            <Box
              sx={{ display: "flex", justifyContent: "center", my: 1, px: 1 }}
            >
              <ColorModeToggle />
            </Box>
            {session?.user?.role.includes("ADMIN") && (
              <ListItem sx={{ mt: 0 }}>
                <NextLink href="/dashboard">
                  <ListItemButton>
                    <SpeedIcon sx={{ mr: 1 }} />
                    Dashboard
                  </ListItemButton>
                </NextLink>
              </ListItem>
            )}
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
    </>
  );
}

export default DefaultLayout;

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
