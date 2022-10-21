import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import QuestionSheet from "@/components/QuestionSheet";
import { useContext, useEffect } from "react";
import SheetContext from "@/contexts/SheetContext";

const ModelTest = () => {
  const router = useRouter();
  const query = router.query;
  const { questionSet, answerSheet } = useContext(SheetContext);

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
        <Button disableElevation variant="contained" size="large">
          Finish Test
        </Button>
      </Box>

      <QuestionSheet />
    </Box>
  );
};

export default ModelTest;
