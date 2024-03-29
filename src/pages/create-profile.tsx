import { useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
// import NextLink from "next/link";
// import Button from "@mui/material/Button";
// import Breadcrumbs from "@mui/material/Breadcrumbs";
// import IconButton from "@mui/material/IconButton";
// import HomeIcon from "@mui/icons-material/Home";
// import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";
import * as yup from "yup";
import type { NextPageWithLayout } from "@/pages/_app";
import { toast } from "react-toastify";

type CreateProfileFields = {
  fullName: string;
  phone: string;
  institute: string;
};

const validationSchema = yup.object().shape({
  fullName: yup.string().min(4).max(100).required("Your full name is required"),
  phone: yup
    .string()
    .min(11)
    .max(15)
    .matches(/^[0-9]+$/, "Phone number can only contain numbers")
    .required("Your phone number is required"),
  institute: yup.string().min(4).max(1024).required("Field is required"),
});

const CreateProfile: NextPageWithLayout = () => {
  const { data: session } = useSession({ required: true });
  const createProfileMutation = trpc.user.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Registration completed!");
      location.reload();
    },
    onError: () => {
      toast.error("An Error occured!");
    },
  });

  const formik = useFormik<CreateProfileFields>({
    initialValues: {
      fullName: session?.user?.name ?? "",
      phone: "",
      institute: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      createProfileMutation.mutate(values);
    },
  });
  useEffect(() => {
    if (session?.user?.profileId) {
      Router.push("/app");
    }
  }, [session?.user?.profileId]);

  if (!session) return <></>;

  return (
    <>
      <Head>
        <title>Create Profile | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 6 }}>
        <Card sx={{ maxWidth: 600, mx: "auto" }}>
          <CardContent>
            <Typography gutterBottom variant="h5" sx={{ mb: 2 }}>
              Complete Your Registration
            </Typography>
            <Box component={"form"} onSubmit={formik.handleSubmit}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.fullName && !!formik.errors.fullName}
                helperText={formik.touched.fullName && formik.errors.fullName}
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.phone && !!formik.errors.phone}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                label="Your Institute"
                name="institute"
                value={formik.values.institute}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.institute && !!formik.errors.institute}
                helperText={formik.touched.institute && formik.errors.institute}
              />
              <Box sx={{ mt: 2 }}>
                <LoadingButton
                  loading={createProfileMutation.isLoading}
                  type="submit"
                  variant="contained"
                >
                  Complete Registration
                </LoadingButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default CreateProfile;
