import { useRouter } from "next/router";
import { formatDuration, intervalToDuration } from "date-fns";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import Typography from "@mui/material/Typography";
import QuestionSheet from "@/components/QuestionSheet";
import { useContext, useEffect, useState } from "react";
import SheetContext from "@/contexts/SheetContext";

const ModelTest = () => {
  const router = useRouter();
  const query = router.query;
  const { questionSet, answerSheet } = useContext(SheetContext);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!questionSet) return;
    const [firstQs] = questionSet.questions;
    if (!query.q) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, q: firstQs?.order },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [query.q, JSON.stringify(questionSet?.questions)]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!answerSheet?.expireAt) {
        setTime("");
        clearInterval(interval);
        return;
      }
      if (answerSheet.expireAt.getTime() < Date.now()) {
        setTime("time_up");
        clearInterval(interval);
        return;
      }
      const duration = intervalToDuration({
        start: Date.now(),
        end: answerSheet.expireAt,
      });
      setTime(
        formatDuration(duration, {
          delimiter: ":",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [answerSheet?.expireAt?.toString()]);

  // useEffect(() => {
  //   const beforeUnload = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = "";
  //   };
  //   const handleRouteChange = () => {
  //     console.log("route change");
  //   };
  //   router.events.on("routeChangeStart", (e) => {
  //     console.log(e);
  //   });
  //   window.addEventListener("beforeunload", beforeUnload);
  //   return () => {
  //     router.events.off("routeChangeStart", handleRouteChange);
  //     window.removeEventListener("beforeunload", beforeUnload);
  //   };
  // }, []);

  if (!questionSet || !answerSheet) return <></>;

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {questionSet.title}
        </Typography>
        <Box sx={{ mr: 0, ml: "auto" }} />
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
      </Box>

      <QuestionSheet />
    </Box>
  );
};

export default ModelTest;
