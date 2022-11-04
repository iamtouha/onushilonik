import { useContext, useEffect, useMemo, useState } from "react";
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
import { OPTION } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { Question as QuestionLoading } from "./QuestionSkeleton";
import SheetContext from "@/contexts/SheetContext";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import ShortNote from "../ShortNote";

export default function QuestionSheet() {
  const router = useRouter();
  const order = Number(router.query.q);
  const { questionSet, answerSheet, refetchAnswerSheet } =
    useContext(SheetContext);
  const questions = useMemo(
    () => questionSet?.questions ?? [],
    [JSON.stringify(questionSet?.questions)]
  );
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<OPTION>();

  const {
    data: question,
    refetch,
    isLoading,
    isError,
  } = trpc.useQuery(
    [
      "question.get-answer",
      { id: selectedQuestion ?? "", sheetId: answerSheet?.id ?? "" },
    ],
    { enabled: !!selectedQuestion && !!answerSheet?.id }
  );
  const { data: statsData } = trpc.useQuery(
    ["question.get-stats", { id: selectedQuestion ?? "" }],
    { enabled: !!selectedQuestion }
  );
  const { data: shortNote, isLoading: noteLoading } = trpc.useQuery(
    ["question.get-short-note", { id: selectedQuestion ?? "" }],
    { enabled: !!selectedQuestion && !!question?.answers[0] }
  );
  const answerQuestionMutation = trpc.useMutation("answersheet.add-answer", {
    onSuccess: () => {
      refetch({});
      refetchAnswerSheet();
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
  const navigation = useMemo(
    () => ({
      next: questions.find((q) => q.order === order + 1)?.order,
      prev: questions.find((q) => q.order === order - 1)?.order,
    }),
    [order, JSON.stringify(questions)]
  );
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

  const getButtonColor = (id: string) => {
    const answer = answerSheet?.answers.find((a) => a.question.id === id);
    if (!answer) return "inherit";
    if (answer.option === answer.question.correctOption) return "success";
    return "error";
  };

  useEffect(() => {
    if (!order) return;
    const selected = questions.find((q) => q.order === order);
    if (selected) {
      setSelectedQuestion(selected.question.id);
    }
  }, [order, JSON.stringify(questions)]);

  useEffect(() => {
    setSelectedOption(undefined);
  }, [order, JSON.stringify(question)]);
  useEffect(() => {
    if (answer) {
      setSelectedOption(answer.option);
    }
  }, [JSON.stringify(answer)]);

  if (!answerSheet) return <></>;

  return (
    <Box>
      <Grid container spacing={{ xs: 2, md: 6 }}>
        <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
          {isError && (
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
          {isLoading && <QuestionLoading />}

          {question && (
            <Box sx={{ my: 2, userSelect: "none" }}>
              <Typography variant="body1" component="p" gutterBottom>
                {question.stem}
              </Typography>
              {answer ? (
                <Box sx={{ mt: 4 }}>
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
                  loading={answerQuestionMutation.isLoading || isLoading}
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
            Question {order} of {questions.length}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {questions.map((q) => (
              <Button
                variant="outlined"
                sx={{
                  fontWeight: "bold",
                }}
                color={getButtonColor(q.question.id)}
                key={q.question.id}
                disabled={q.order === order}
                onClick={() => navigateTo(q.order)}
              >
                {q.order}
              </Button>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={8} order={{ xs: 3, md: 3 }}>
          {answer ? (
            <Box>
              <Typography variant="h5" component="h5" gutterBottom>
                Short Note:
              </Typography>
              {noteLoading ? <></> : <></>}
              {shortNote ? (
                <ShortNote content={shortNote.content} />
              ) : (
                "No short note found for this question"
              )}
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

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
