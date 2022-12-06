import NextLink from "next/link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

const routes = [
  { path: "/terms-and-conditions", name: "Terms and Conditions" },
  { path: "/privacy-policy", name: "Privacy Policy" },
];

const Footer = () => {
  return (
    <Paper sx={{ borderRadius: 0, px: 2, py: 4 }}>
      <Box sx={{ display: "flex" }}>
        <List dense>
          {routes.map((route) => (
            <ListItem key={route.name}>
              <ListItemButton LinkComponent={NextLink} href={route.path}>
                <ListItemText primary={route.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};
export default Footer;
