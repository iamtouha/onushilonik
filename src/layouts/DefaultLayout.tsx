import Box from "@mui/material/Box";

type DefaultLayoutProps = {
  children: React.ReactNode;
};
const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return <Box>{children}</Box>;
};

export default DefaultLayout;
