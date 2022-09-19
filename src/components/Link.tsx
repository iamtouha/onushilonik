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
    <NextLink href={props.href} as={props.as} passHref>
      <MuiLink
        underline={props.underline}
        sx={props.sx}
        color={props.color}
        component="a"
      >
        {props.children}
      </MuiLink>
    </NextLink>
  );
};

export default Link;
