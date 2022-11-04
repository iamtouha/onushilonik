import { useEffect, useState, useMemo } from "react";
import { formatDuration, intervalToDuration } from "date-fns";
import Head from "next/head";
import { useRouter } from "next/router";
import isAfter from "date-fns/isAfter";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress, {
  LinearProgressProps,
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SheetContext from "@/contexts/SheetContext";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { NextPageWithLayout } from "@/pages/_app";
import SubscriptionLayout from "@/layouts/SubscriptionLayout";
import { trpc } from "@/utils/trpc";
import QuestionSkeleton, {
  Question as QuestionLoading,
} from "@/components/QuestionSkeleton";
import DefaultLayout from "@/layouts/DefaultLayout";
import { OPTION } from "@prisma/client";
import { toast } from "react-toastify";
import ShortNote from "@/components/ShortNote";
import BorderedCircularProgress from "@/components/elements/BorderedCircularProgress";

const AnswerSheet: NextPageWithLayout = () => {
  const router = useRouter();
  const { code: setCode, id: sheetId, q: qsOrder } = router.query;
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<OPTION>();

  const {
    data: questionSet,
    isLoading: setLoading,
    isError: setError,
  } = trpc.useQuery(["questionset.get", { code: setCode as string }], {
    refetchOnWindowFocus: false,
    enabled: !!setCode,
  });
  const {
    data: answerSheet,
    isError: sheetError,
    isLoading: sheetLoading,
    refetch: refetchSheet,
  } = trpc.useQuery(["answersheet.get", { id: sheetId as string }], {
    refetchOnWindowFocus: false,
    enabled: !!sheetId,
  });
  const {
    data: question,
    refetch: refetchQuestion,
    isLoading: questionLoading,
    isError: questionError,
  } = trpc.useQuery(
    [
      "question.get-answer",
      { id: selectedQuestion ?? "", sheetId: answerSheet?.id ?? "" },
    ],
    {
      enabled: !!selectedQuestion && !!answerSheet?.id,
      refetchOnWindowFocus: false,
    }
  );

  const { data: statsData } = trpc.useQuery(
    ["question.get-stats", { id: selectedQuestion ?? "" }],
    {
      enabled: !!selectedQuestion && !!question?.answers[0],
      refetchOnWindowFocus: false,
    }
  );
  const { data: shortNote, isLoading: noteLoading } = trpc.useQuery(
    ["question.get-short-note", { id: selectedQuestion ?? "" }],
    {
      enabled: !!selectedQuestion && !!question?.answers[0],
      refetchOnWindowFocus: false,
    }
  );
  const answerQuestionMutation = trpc.useMutation("answersheet.add-answer", {
    onSuccess: () => {
      refetchQuestion();
      refetchSheet();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const stats = useMemo(() => {
    const initial = { A: 0, B: 0, C: 0, D: 0, total: 0 };
    if (!statsData) return initial;
    return statsData.reduce((acc, curr) => {
      acc[curr.option] += curr._count;
      acc.total += curr._count;
      return acc;
    }, initial);
  }, [JSON.stringify(statsData)]);
  const answer = useMemo(
    () => question?.answers[0] ?? null,
    [JSON.stringify(question?.answers)]
  );
  const navigation = useMemo(() => {
    const order = parseInt(qsOrder as string);
    if (!questionSet?.questions) return { prev: null, next: null };
    return {
      next: questionSet.questions.find((q) => q.order === order + 1)?.order,
      prev: questionSet.questions.find((q) => q.order === order - 1)?.order,
    };
  }, [qsOrder, JSON.stringify(questionSet?.questions)]);
  const answerQuestion = () => {
    if (!selectedQuestion || !answerSheet) return;
    if (!selectedOption) {
      toast.error("Please select the correct option");
      return;
    }
    answerQuestionMutation.mutate({
      answerSheetId: answerSheet?.id,
      questionId: selectedQuestion,
      option: selectedOption,
    });
  };

  const navigateTo = (order: number) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, q: order } },
      undefined,
      { shallow: true }
    );
  };
  const calculateResult = () => {
    if (!answerSheet || !questionSet) {
      return {
        label: "",
        value: 0,
      };
    }
    const correct = answerSheet.answers.filter(
      (a) => a.question.correctOption === a.option
    ).length;
    const total = questionSet.questions.length;
    return {
      label: `${Math.round((100 * correct) / total)}%`,
      value: correct / total,
    };
  };
  const getButtonColor = (id: string) => {
    const answer = answerSheet?.answers.find((a) => a.question.id === id);
    if (!answer) return "inherit";
    if (answer.option === answer.question.correctOption) return "success";
    return "error";
  };

  useEffect(() => {
    if (!questionSet?.questions) return;
    const [firstQs] = questionSet.questions;
    if (!qsOrder) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, q: firstQs?.order },
        },
        undefined,
        { shallow: true }
      );
      return;
    }
    const order = parseInt(qsOrder as string);
    const selected = questionSet?.questions.find((q) => q.order === order);
    if (selected) {
      setSelectedQuestion(selected.question.id);
      return;
    }
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, q: firstQs?.order },
      },
      undefined,
      { shallow: true }
    );
  }, [qsOrder, router.push, JSON.stringify(questionSet?.questions)]);
  useEffect(() => {
    setSelectedOption(undefined);
  }, [qsOrder, JSON.stringify(question)]);
  useEffect(() => {
    if (answer?.option) {
      setSelectedOption(answer.option);
    }
  }, [answer?.option]);

  return (
    <>
      <Head>
        <title>{questionSet?.title} - Answer Sheet | Onushilonik</title>
      </Head>
      <Container>
        {setError && (
          <Alert
            severity="error"
            title="Something went wrong!"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" onClick={() => window?.location.reload()}>
                Reload
              </Button>
            }
          >
            Could not load the question set. Please try again.
          </Alert>
        )}
        {sheetError && (
          <Alert
            severity="error"
            title="Something went wrong!"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" onClick={() => window?.location.reload()}>
                Reload
              </Button>
            }
          >
            Could not load the your answers. Please try again.
          </Alert>
        )}
        {(sheetLoading || setLoading) && <QuestionSkeleton />}
        {questionSet && answerSheet ? (
          <>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  {questionSet.title}
                </Typography>
                <Box sx={{ mr: 0, ml: "auto" }} />
                <TimeCounter expireAt={answerSheet.expireAt} />
              </Box>
            </Box>

            <Grid container spacing={{ xs: 2, md: 6 }}>
              <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
                {questionError && (
                  <Alert
                    severity="error"
                    title="Something went wrong!"
                    sx={{ mt: 2 }}
                    action={
                      <Button
                        color="inherit"
                        onClick={() => window?.location.reload()}
                      >
                        Reload
                      </Button>
                    }
                  >
                    Could not load the question set. Please try again.
                  </Alert>
                )}
                {questionLoading && <QuestionLoading />}

                {question && (
                  <Box sx={{ userSelect: "none" }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <Typography
                          variant="body1"
                          component="p"
                          color={"primary"}
                          gutterBottom
                          sx={{ fontWeight: "bold" }}
                        >
                          Q-{question.code}
                        </Typography>
                        <Box sx={{ mr: 0, ml: "auto" }} />
                      </Box>
                    </Box>
                    <Typography variant="body1" component="p" gutterBottom>
                      {question.stem}
                    </Typography>
                    {answer ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ my: 2 }}
                        >
                          {(stats[question.correctOption] / stats.total) * 100}%
                          students answered correctly. Total {stats.total}{" "}
                          students answered.
                        </Typography>
                        <AnswerStat
                          label={`A) ${question.optionA}`}
                          isAnswered={answer.option === OPTION.A}
                          isCorrect={question.correctOption === OPTION.A}
                          value={(stats.A / stats.total) * 100}
                        />
                        <AnswerStat
                          label={`B) ${question.optionB}`}
                          isAnswered={answer.option === OPTION.B}
                          isCorrect={question.correctOption === OPTION.B}
                          value={(stats.B / stats.total) * 100}
                        />
                        <AnswerStat
                          label={`C) ${question.optionC}`}
                          isAnswered={answer.option === OPTION.C}
                          isCorrect={question.correctOption === OPTION.C}
                          value={(stats.C / stats.total) * 100}
                        />
                        <AnswerStat
                          label={`D) ${question.optionD}`}
                          isAnswered={answer.option === OPTION.D}
                          isCorrect={question.correctOption === OPTION.D}
                          value={(stats.D / stats.total) * 100}
                        />
                      </Box>
                    ) : (
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel
                          id="option-group-input-label"
                          sx={{ color: "inherit" }}
                        >
                          Select the correct option
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="option-group-input-label"
                          name="option-buttons-group"
                          value={selectedOption ?? ""}
                          onChange={(e, val) => {
                            if (!answer) setSelectedOption(val as OPTION);
                          }}
                        >
                          <FormControlLabel
                            value={OPTION.A}
                            control={<Radio />}
                            disabled={
                              answerSheet.expireAt
                                ? isAfter(Date.now(), answerSheet.expireAt)
                                : false
                            }
                            label={`A) ${question.optionA}`}
                          />
                          <FormControlLabel
                            value={OPTION.B}
                            control={<Radio />}
                            disabled={
                              answerSheet.expireAt
                                ? isAfter(Date.now(), answerSheet.expireAt)
                                : false
                            }
                            label={`B) ${question.optionB}`}
                          />
                          <FormControlLabel
                            value={OPTION.C}
                            control={<Radio />}
                            disabled={
                              answerSheet.expireAt
                                ? isAfter(Date.now(), answerSheet.expireAt)
                                : false
                            }
                            label={`C) ${question.optionC}`}
                          />
                          <FormControlLabel
                            value={OPTION.D}
                            control={<Radio />}
                            disabled={
                              answerSheet.expireAt
                                ? isAfter(Date.now(), answerSheet.expireAt)
                                : false
                            }
                            label={`D) ${question.optionD}`}
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      <LoadingButton
                        size="large"
                        variant={"outlined"}
                        disabled={!!answer || !question || !answerSheet}
                        onClick={answerQuestion}
                        loading={
                          answerQuestionMutation.isLoading || questionLoading
                        }
                      >
                        {!!answer ? "Answer Submitted" : "Submit answer"}
                      </LoadingButton>
                      <div style={{ marginRight: 0, marginLeft: "auto" }} />
                      <IconButton
                        color="primary"
                        disabled={!navigation.prev}
                        onClick={() => navigateTo(navigation.prev ?? 0)}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        disabled={!navigation.next}
                        onClick={() => navigateTo(navigation.next ?? 0)}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
                <Typography variant="body1" component="p" gutterBottom>
                  Question {qsOrder} of {questionSet.questions.length}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
                  {questionSet.questions.map((q) => (
                    <Button
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                      }}
                      color={getButtonColor(q.question.id)}
                      key={q.question.id}
                      disabled={q.order === parseInt(qsOrder as string)}
                      onClick={() => navigateTo(q.order)}
                    >
                      {q.order}
                    </Button>
                  ))}
                </Box>
                <Typography variant="body1" component="p" gutterBottom>
                  Your Score:
                </Typography>
                <Box sx={{ p: 2 }}>
                  <BorderedCircularProgress
                    color="info"
                    size={100}
                    value={Math.round(calculateResult().value * 100)}
                    label={calculateResult().label}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8} order={{ xs: 3, md: 3 }}>
                {answer ? (
                  <Box>
                    <Typography variant="h5" component="h5" gutterBottom>
                      Short Note:
                    </Typography>
                    {shortNote ? (
                      <ShortNote content={shortNote.content} />
                    ) : (
                      "No short note found for this question"
                    )}
                  </Box>
                ) : null}
              </Grid>
            </Grid>
          </>
        ) : null}
      </Container>
    </>
  );
};

AnswerSheet.getLayout = (page) => (
  <DefaultLayout>
    <SubscriptionLayout>{page}</SubscriptionLayout>
  </DefaultLayout>
);

export default AnswerSheet;

const TimeCounter = ({ expireAt }: { expireAt: Date | null }) => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      if (!expireAt) {
        setTime("");
        clearInterval(interval);
        return;
      }
      if (expireAt.getTime() < Date.now()) {
        setTime("time_up");
        clearInterval(interval);
        return;
      }
      const duration = intervalToDuration({
        start: Date.now(),
        end: expireAt,
      });
      setTime(
        formatDuration(duration, {
          delimiter: ":",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [expireAt?.toString()]);

  return (
    <>
      {time.length ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {time === "time_up" ? (
            <HourglassBottomIcon color="error" sx={{ mr: 1 }} />
          ) : (
            <HourglassTopIcon color="success" sx={{ mr: 1 }} />
          )}
          <Typography
            variant="h6"
            color={time === "time_up" ? "error" : "success"}
            component="h2"
          >
            {time === "time_up" ? "Time Up!" : time}
          </Typography>
        </Box>
      ) : null}
    </>
  );
};

const AnswerStat = ({
  label,
  value,
  isAnswered,
  isCorrect,
}: {
  label: string;
  value: number;
  isAnswered: boolean;
  isCorrect: boolean;
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body1" component="p">
        {label}
      </Typography>
      <LinearProgressWithLabel
        color={
          isAnswered
            ? isCorrect
              ? "success"
              : "error"
            : isCorrect
            ? "success"
            : "info"
        }
        value={value ?? 0}
      />
    </Box>
  );
};

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {},
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));