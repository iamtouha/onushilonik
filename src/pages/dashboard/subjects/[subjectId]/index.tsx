import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
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
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import { format } from "date-fns";

interface UpdateSubjectForm {
  title: string;
  published: boolean;
}

const validationSchema = yup.object().shape({
  title: yup.string().min(2).max(100).required("Title is required"),
  published: yup.boolean(),
});

const Subject: NextPageWithLayout = () => {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    data: subject,
    isLoading,
    isError,
    error,
  } = trpc.admin.subjects.getOne.useQuery(router.query.subjectId as string, {
    enabled: !!router.query.subjectId,
    refetchOnWindowFocus: false,
  });
  const updateSubjectMutation = trpc.admin.subjects.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.title} updated!`);
        router.push("/dashboard/subjects");
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
  const deleteSubjectMutation = trpc.admin.subjects.delete.useMutation({
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`${data.title} deleted!`);
        router.push("/dashboard/subjects");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.error(error.message);
      toast.error("Could not delete subject");
    },
  });
  const formik = useFormik<UpdateSubjectForm>({
    initialValues: {
      title: subject?.title ?? "",
      published: subject?.published ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!subject) return;
      const { title, published } = subject;
      if (JSON.stringify(values) === JSON.stringify({ title, published })) {
        toast.info("No changes made");
        return;
      }
      updateSubjectMutation.mutate({ ...values, id: subject.id });
    },
  });

  const deleteSubject = () => {
    if (!subject) return;
    deleteSubjectMutation.mutate(subject.id);
  };

  return (
    <>
      <Head>
        <title>{subject?.title} | Onushilonik Dashboard</title>
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
          <Link href="/dashboard/subjects" underline="hover" color="inherit">
            Subjects
          </Link>
          <Typography color="inherit">{subject?.title ?? "Subject"}</Typography>
        </Breadcrumbs>
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
          {subject?.title}
        </Typography>

        {subject && (
          <>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ maxWidth: 600, mt: 4 }}
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
                value={subject.code}
                fullWidth
                sx={{ mb: 2 }}
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
              {updateSubjectMutation.isError && (
                <Alert severity="error">
                  {updateSubjectMutation.error?.message}
                </Alert>
              )}

              <LoadingButton
                loading={updateSubjectMutation.isLoading}
                variant="contained"
                type="submit"
                size="large"
              >
                Update Subject
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
              Created at {format(subject.createdAt, "hh:mm a, dd/MM/yyyy")} by{" "}
              {subject.createdBy?.name ?? "Unknown"}
            </Typography>
            {subject.updatedBy && (
              <Typography variant="body2" color={"GrayText"} gutterBottom>
                Last updated at{" "}
                {format(subject.updatedAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                {subject.updatedBy.name ?? "Unknown"}
              </Typography>
            )}
          </>
        )}
      </Container>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete subject"
        aria-describedby="confirm delete subject"
      >
        <DialogTitle>{`Delete "${subject?.title}"?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subject? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            onClick={deleteSubject}
            loading={deleteSubjectMutation.isLoading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

Subject.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Subject;
