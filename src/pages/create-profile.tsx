import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";

type CreateProfileFields = {
  fullName: string;
  email: string;
  phone: string;
  institute: string;
};

const CreateProfile: NextPageWithLayout = () => {
  const { data: session } = useSession({ required: true });
  const createProfileMutation = trpc.useMutation([""]);

  const formik = useFormik<CreateProfileFields>({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      institute: "",
    },
    onSubmit: async (values) => {
        await .mutateAsync(values);
    }
  });

  if (!session) return <></>;

  return (
    <>
      <Head>
        <title>Create Profile | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Create Profile
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
        <Box component={"form"}></Box>
      </Container>
    </>
  );
};

CreateProfile.getLayout = (page) => <>{page}</>;

export default CreateProfile;
