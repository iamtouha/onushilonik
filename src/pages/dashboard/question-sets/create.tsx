import { useState, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import Paper from "@mui/material/Paper";
import QuestionSetForm from "@/components/QuestionSetForm";
import { SET_TYPE } from "@prisma/client";

const OrderList = dynamic(() => import("@/components/OrderList"), {
  ssr: false,
});

type Qs = { code: string; stem: string; id: string };

const NewQuestionSet: NextPageWithLayout = () => {
  const [addedQuestions, setAddedQuestions] = useState<Qs[]>([]);
  const formRef = useRef<HTMLFormElement | null>(null);
  const addSetMutation = trpc.useMutation("admin.sets.add", {
    onSuccess: (data) => {
      if (data) {
        formRef.current?.reset();
        setAddedQuestions([]);
        toast.success(`${data.code} added!`);
      }
    },
    onError: (error) => {
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

  const reOrder = (id: string, dir: "up" | "down") => {
    setAddedQuestions((questions) => {
      const dragIndex = questions.findIndex((q) => q.id === id);
      const dropIndex = dir === "up" ? dragIndex - 1 : dragIndex + 1;
      const newQuestions = [...questions];
      const dragQs = newQuestions[dragIndex];
      const dropQs = newQuestions[dropIndex];
      if (!dropQs || !dragQs) {
        return questions;
      }
      newQuestions[dragIndex] = dropQs;
      newQuestions[dropIndex] = dragQs;
      return newQuestions;
    });
  };

  return (
    <>
      <Head>
        <title>New Questions Set | Onushilonik Dashboard</title>
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
          <Link
            href="/dashboard/question-sets"
            underline="hover"
            color="inherit"
          >
            Question Sets
          </Link>
          <Typography color="inherit">New Question Set</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          New Question Set
        </Typography>
        <Grid container spacing={4} sx={{ pb: 6 }}>
          <Grid item xs={12} md={6}>
            <QuestionSetForm
              ref={formRef}
              formType="create"
              addedQuestions={addedQuestions}
              setAddedQuestions={setAddedQuestions}
              loading={addSetMutation.isLoading}
              onSubmit={(values) => {
                addSetMutation.mutate({
                  ...values,
                  chapterId:
                    values.type === SET_TYPE.QUESTION_BANK
                      ? values.chapterId
                      : undefined,
                });
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ height: "100%" }}>
            <Paper sx={{ overflowY: "auto", height: 450 }}>
              <OrderList
                items={addedQuestions}
                onRemove={(id) =>
                  setAddedQuestions(addedQuestions.filter((q) => q.id !== id))
                }
                moveUp={(id) => reOrder(id, "up")}
                moveDown={(id) => reOrder(id, "down")}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

NewQuestionSet.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default NewQuestionSet;
