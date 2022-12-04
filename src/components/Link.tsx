import React from "react";
import NextLink from "next/link";
import MuiLink from "@mui/material/Link";
import { type SxProps } from "@mui/system";

type Props = {
  children: React.ReactNode;
  href: string;
  underline?: "none" | "hover" | "always";
  sx?: SxProps;
  as?: string;
  color?: string;
};

const Link = (props: Props) => {
  return (
    <MuiLink
      underline={props.underline}
      component={NextLink}
      sx={props.sx}
      color={props.color}
      href={props.href}
    >
      {props.children}
    </MuiLink>
  );
};

export default Link;
