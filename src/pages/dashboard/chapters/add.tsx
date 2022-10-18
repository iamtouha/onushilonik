import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
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

interface ChapterForm {
  title: string;
  code: string;
  subjectId: string;
  published: boolean;
}

const validationSchema = yup.object().shape({
  title: yup.string().min(2).max(100).required("Chapter Title is required"),
  code: yup.string().min(2).max(100).required("Chapter Code is required"),
  subjectId: yup.string().required("Subject is required"),
  published: yup.boolean(),
});

const AddChapter: NextPageWithLayout = () => {
  const { data: subjects } = trpc.useQuery(["admin.subjects.list"]);
  const addChapterMutation = trpc.useMutation("admin.chapters.add", {
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.title} added!`);
      }
    },
    onError: (error) => {
      console.log(error.message);

      if (error.data?.code === "CONFLICT") {
        toast.error("Chapter with this code already exists");
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Invalid form data");
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const formik = useFormik<ChapterForm>({
    initialValues: {
      title: "",
      code: "",
      published: true,
      subjectId: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await addChapterMutation
        .mutateAsync(values)
        .then(() => resetForm())
        .catch((error) => console.error(error.message));
    },
  });

  return (
    <>
      <Head>
        <title>Add Chapter | Onushilonik Dashboard</title>
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
          <Link href="/dashboard/chapters" underline="hover" color="inherit">
            Chapters
          </Link>
          <Typography color="inherit">Add Chapter</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          Add Chapter
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ maxWidth: 600 }}
        >
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl
                sx={{ mb: 2 }}
                fullWidth
                error={formik.touched.subjectId && !!formik.errors.subjectId}
              >
                <InputLabel id="demo-simple-select-label">
                  Select Subject
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  name="subjectId"
                  value={formik.values.subjectId}
                  label="Select Subject"
                  onChange={formik.handleChange}
                >
                  {subjects?.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.title}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.subjectId && (
                  <FormHelperText>{formik.errors.subjectId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            name="title"
            label="Chapter Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.title && !!formik.errors.title}
            helperText={formik.touched.title && formik.errors.title}
          />
          <TextField
            label="Chapter Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
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
            loading={addChapterMutation.isLoading}
            variant="contained"
            type="submit"
            size="large"
          >
            Add Chapter
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
};

AddChapter.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddChapter;
