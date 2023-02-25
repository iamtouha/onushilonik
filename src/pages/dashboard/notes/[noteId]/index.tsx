import React, { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { format } from "date-fns";
import * as yup from "yup";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import ShortNote from "@/components/ShortNote";

const ResizableTextarea = styled(TextField)(({ theme }) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
  textarea: {
    resize: "vertical",
  },
}));

interface UpdateNoteForm {
  title: string;
  content: string;
  published: boolean;
}

const validationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  content: yup.string().max(2048).required("Note Content is required"),
  published: yup.boolean(),
});

const AddNote: NextPageWithLayout = () => {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    data: note,
    isLoading,
    isError,
    error,
  } = trpc.admin.notes.getOne.useQuery(router.query.noteId as string, {
    enabled: !!router.query.noteId,
    refetchOnWindowFocus: false,
    onSuccess(data) {
      if (data) {
        setSubjectId(data.chapter.subjectId);
        setChapterId(data.chapter.id);
        setContent(data.content);
      }
    },
  });
  const deleteNoteMutation = trpc.admin.notes.delete.useMutation({
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`"${data.code}" deleted!`);
        router.push("/dashboard/notes");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.error(error.message);
      toast.error("Could not delete note");
    },
  });

  const { data: subjects } = trpc.admin.subjects.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: chapters } = trpc.admin.chapters.list.useQuery(subjectId, {
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
  });

  const updateNoteMutation = trpc.admin.notes.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.code} added!`);
        router.push("/dashboard/notes");
      }
    },
    onError: (error) => {
      console.error(error.message);
      if (error.data?.code === "CONFLICT") {
        toast.error("Question with this code already exists");
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Invalid form data");
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const formik = useFormik<UpdateNoteForm>({
    initialValues: {
      title: note?.title || "",
      published: note?.published || true,
      content: note?.content || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!note) return;
      if (!chapterId.length) {
        toast.warn("Select a chapter");
        return;
      }
      await updateNoteMutation
        .mutateAsync({ ...values, chapterId, id: note.id })
        .then(() => resetForm())
        .catch((error) => console.error(error.message));
    },
  });

  const deleteNote = () => {
    if (!note) return;
    deleteNoteMutation.mutate(note.id);
  };
  return (
    <>
      <Head>
        <title>Add Note | Onushilonik Dashboard</title>
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
          <Link href="/dashboard/notes" underline="hover" color="inherit">
            Notes
          </Link>
          <Typography color="inherit">{note?.code}</Typography>
        </Breadcrumbs>
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        {note && (
          <>
            <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
              {note.title}
            </Typography>

            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ pb: { lg: 4, xs: 1 } }}
                >
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="subject-select-label">
                          Select Subject
                        </InputLabel>
                        <Select
                          labelId="subject-select-label"
                          name="subjectId"
                          value={subjectId}
                          label="Select Subject"
                          onChange={(e) =>
                            setSubjectId(e.target.value as string)
                          }
                        >
                          <MenuItem value="" disabled>
                            Select an option
                          </MenuItem>
                          {subjects?.map((subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                              {subject.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={6}>
                      {chapters && (
                        <FormControl fullWidth>
                          <InputLabel id="chapter-select-label">
                            Select Chapter
                          </InputLabel>
                          <Select
                            labelId="chapter-select-label"
                            name="chapterId"
                            value={chapterId}
                            label="Select Chapter"
                            onChange={(e) =>
                              setChapterId(e.target.value as string)
                            }
                          >
                            <MenuItem value="" disabled>
                              Select an option
                            </MenuItem>
                            {chapters?.map((chapter) => (
                              <MenuItem key={chapter.id} value={chapter.id}>
                                {chapter.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="Note Code"
                        value={note.code}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        label="Note Title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        fullWidth
                        error={formik.touched.title && !!formik.errors.title}
                        helperText={formik.touched.title && formik.errors.title}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <Box>
                        <FormControlLabel
                          control={
                            <Android12Switch
                              checked={formik.values.published}
                            />
                          }
                          name="published"
                          onChange={formik.handleChange}
                          label="Publish"
                        />
                      </Box>
                    </Grid>
                    <Grid xs={12} md={12}>
                      <ResizableTextarea
                        name="content"
                        multiline
                        rows={5}
                        sx={{ resize: "vertical" }}
                        fullWidth
                        label="Note Content (Markdown)"
                        value={formik.values.content}
                        onChange={(e) => {
                          setContent(e.target.value);
                          formik.handleChange(e);
                        }}
                        error={
                          formik.touched.content && !!formik.errors.content
                        }
                        helperText={
                          formik.touched.content && formik.errors.content
                        }
                      />
                    </Grid>
                  </Grid>

                  <LoadingButton
                    loading={updateNoteMutation.isLoading}
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Update Note
                  </LoadingButton>
                  <Button
                    sx={{ ml: 2 }}
                    size="large"
                    color="error"
                    onClick={() => setConfirmDelete(true)}
                  >
                    {"Delete"}
                  </Button>
                </Box>
                <Typography
                  sx={{ mt: { xs: 1, lg: 3 } }}
                  variant="body2"
                  color={"GrayText"}
                  gutterBottom
                >
                  Created at {format(note.createdAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                  {note.createdBy?.name ?? "Unknown"}
                </Typography>
                {note.updatedBy && (
                  <Typography variant="body2" color={"GrayText"} gutterBottom>
                    Last updated at{" "}
                    {format(note.updatedAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                    {note.updatedBy.name ?? "Unknown"}
                  </Typography>
                )}
              </Grid>
              <Grid xs={12} md={6}>
                {content.length ? (
                  <ShortNote content={content} />
                ) : (
                  <Typography variant="body1" color="GrayText">
                    <i>Markdown Preview wil appear here</i>
                  </Typography>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Container>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete chapter"
        aria-describedby="confirm delete chapter"
      >
        <DialogTitle>{`Delete Question "${note?.code}"?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            onClick={deleteNote}
            loading={deleteNoteMutation.isLoading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

AddNote.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNote;
