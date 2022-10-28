import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";

interface SubjectForm {
  title: string;
  code: string;
  published: boolean;
}

const validationSchema = yup.object().shape({
  title: yup.string().min(2).max(100).required("Title is required"),
  code: yup.string().min(2).max(100).required("Code is required"),
  published: yup.boolean(),
});

const AddSubject: NextPageWithLayout = () => {
  const addSubjectMutation = trpc.useMutation("admin.subjects.add", {
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.title} added!`);
      }
    },
    onError: (error) => {
      console.error(error.message);

      if (error.data?.code === "CONFLICT") {
        toast.error("Subject with this code already exists");
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Invalid form data");
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const formik = useFormik<SubjectForm>({
    initialValues: {
      title: "",
      code: "",
      published: true,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await addSubjectMutation
        .mutateAsync(values)
        .then(() => resetForm())
        .catch((error) => console.error(error.message));
    },
  });

  return (
    <>
      <Head>
        <title>Add Subject | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link href="/dashboard/subjects" underline="hover" color="inherit">
            Subjects
          </Link>
          <Typography color="inherit">Add Subject</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 6 }}>
          Add Subject
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ maxWidth: 600 }}
        >
          <TextField
            name="title"
            label="Subject Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ minLength: 3, maxLength: 100 }}
            error={formik.touched.title && !!formik.errors.title}
            helperText={formik.touched.title && formik.errors.title}
          />
          <TextField
            label="Subject Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ minLength: 3, maxLength: 100 }}
            error={formik.touched.code && !!formik.errors.code}
            helperText={formik.touched.code && formik.errors.code}
          />
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Android12Switch checked={formik.values.published} />}
              name="published"
              onChange={formik.handleChange}
              label="Publish"
            />
          </Box>

          <LoadingButton
            loading={addSubjectMutation.isLoading}
            variant="contained"
            type="submit"
            size="large"
          >
            Add Subject
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
};

AddSubject.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddSubject;
