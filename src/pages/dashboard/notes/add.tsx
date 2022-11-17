import React, { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
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
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";

import { styled } from "@mui/material/styles";
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

interface NoteForm {
  code: string;
  title: string;
  content: string;
  published: boolean;
}

const validationSchema = yup.object().shape({
  code: yup.string().min(2).max(100).required("Note Code is required"),
  title: yup.string().required("Title is required"),
  content: yup.string().max(2048).required("Note Content is required"),
  published: yup.boolean(),
});

const AddNote: NextPageWithLayout = () => {
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const { data: subjects } = trpc.useQuery(["admin.subjects.list"], {
    refetchOnWindowFocus: false,
  });
  const { data: chapters } = trpc.useQuery(["admin.chapters.list", subjectId], {
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
  });

  const addNoteMutation = trpc.useMutation("admin.notes.add", {
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.code} added!`);
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
  const formik = useFormik<NoteForm>({
    initialValues: {
      title: "",
      code: "",
      published: true,
      content: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!chapterId.length) {
        toast.warn("Select a chapter");
        return;
      }

      await addNoteMutation
        .mutateAsync({ ...values, chapterId })
        .then(() => resetForm())
        .catch((error) => console.error(error.message));
    },
  });

  return (
    <>
      <Head>
        <title>Add Note | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link href="/dashboard/notes" underline="hover" color="inherit">
            Notes
          </Link>
          <Typography color="inherit">Add Note</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
          Add Note
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ pb: 10 }}
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
                      onChange={(e) => setSubjectId(e.target.value as string)}
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
                        onChange={(e) => setChapterId(e.target.value as string)}
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
                    name="code"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    fullWidth
                    error={formik.touched.code && !!formik.errors.code}
                    helperText={formik.touched.code && formik.errors.code}
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
                        <Android12Switch checked={formik.values.published} />
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
                    error={formik.touched.content && !!formik.errors.content}
                    helperText={formik.touched.content && formik.errors.content}
                  />
                </Grid>
              </Grid>

              <LoadingButton
                loading={addNoteMutation.isLoading}
                variant="contained"
                type="submit"
                size="large"
                sx={{ mt: 2 }}
              >
                Add Note
              </LoadingButton>
            </Box>
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
      </Container>
    </>
  );
};

AddNote.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNote;
