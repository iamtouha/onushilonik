import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
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
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import { format } from "date-fns";

interface UpdateChapterForm {
  title: string;
  published: boolean;
  subjectId: string;
}

const validationSchema = yup.object().shape({
  title: yup.string().min(2).max(100).required("Title is required"),
  subjectId: yup.string().required("Subject is required"),
  published: yup.boolean(),
});

const Chapter: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: subjects } = trpc.admin.subjects.list.useQuery();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    data: chapter,
    isLoading,
    isError,
    error,
  } = trpc.admin.chapters.getOne.useQuery(router.query.chapterId as string, {
    enabled: !!router.query.chapterId,
    refetchOnWindowFocus: false,
  });

  const updateChapterMutation = trpc.admin.chapters.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.title} updated!`);
        router.push("/dashboard/chapters");
      }
    },
    onError: (error) => {
      console.error(error.message);

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
  const deleteChapterMutation = trpc.admin.chapters.delete.useMutation({
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`${data.title} deleted!`);
        router.push("/dashboard/chapters");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.error(error.message);
      toast.error("Could not delete chapter");
    },
  });
  const formik = useFormik<UpdateChapterForm>({
    initialValues: {
      title: chapter?.title ?? "",
      published: chapter?.published ?? true,
      subjectId: chapter?.subjectId ?? "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!chapter) return;
      const { title, published, subjectId } = chapter;
      if (
        JSON.stringify(values) ===
        JSON.stringify({ title, published, subjectId })
      ) {
        toast.info("No changes made");
        return;
      }
      updateChapterMutation.mutate({ ...values, id: chapter.id });
    },
  });

  const deleteChapter = () => {
    if (!chapter) return;
    deleteChapterMutation.mutate(chapter.id);
  };

  return (
    <>
      <Head>
        <title>{chapter?.title} | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link href="/dashboard/chapters" underline="hover" color="inherit">
            Chapters
          </Link>
          <Typography color="inherit">{chapter?.title ?? "Chapter"}</Typography>
        </Breadcrumbs>
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
          {chapter?.title}
        </Typography>

        {chapter && (
          <>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ maxWidth: 600, mt: 4 }}
            >
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <FormControl
                    sx={{ mb: 2 }}
                    fullWidth
                    error={
                      formik.touched.subjectId && !!formik.errors.subjectId
                    }
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
                inputProps={{ minLength: 3, maxLength: 100 }}
                error={formik.touched.title && !!formik.errors.title}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                label="Chapter Code"
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{ minLength: 3, maxLength: 100 }}
                value={chapter.code}
                disabled
              />
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Android12Switch checked={formik.values.published} />
                  }
                  name="published"
                  onChange={formik.handleChange}
                  label="Publish"
                />
              </Box>
              {updateChapterMutation.isError && (
                <Alert severity="error">
                  {updateChapterMutation.error?.message}
                </Alert>
              )}

              <LoadingButton
                loading={updateChapterMutation.isLoading}
                variant="contained"
                type="submit"
                size="large"
              >
                Update Chapter
              </LoadingButton>
              <LoadingButton
                sx={{ ml: 2 }}
                size="large"
                color="error"
                onClick={() => setConfirmDelete(true)}
              >
                {"Delete"}
              </LoadingButton>
            </Box>
            <Typography
              sx={{ mt: 4 }}
              variant="body2"
              color={"GrayText"}
              gutterBottom
            >
              Created at {format(chapter.createdAt, "hh:mm a, dd/MM/yyyy")} by{" "}
              {chapter.createdBy?.name ?? "Unknown"}
            </Typography>
            {chapter.updatedBy && (
              <Typography variant="body2" color={"GrayText"} gutterBottom>
                Last updated at{" "}
                {format(chapter.updatedAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                {chapter.updatedBy.name ?? "Unknown"}
              </Typography>
            )}
          </>
        )}
      </Container>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete chapter"
        aria-describedby="confirm delete chapter"
      >
        <DialogTitle>{`Delete "${chapter?.title}"?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chapter? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            onClick={deleteChapter}
            loading={deleteChapterMutation.isLoading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

Chapter.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Chapter;
