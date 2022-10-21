import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

export const Question = () => {
  return (
    <>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width={150} sx={{ mb: 3 }} />
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Skeleton variant="text" width={250} />
        <Skeleton variant="text" width={250} />
        <Skeleton variant="text" width={250} />
        <Skeleton variant="text" width={250} />
      </Stack>
      <Skeleton variant="rounded" height={40} width={120} />
    </>
  );
};

export default function QuestionSkeleton() {
  return (
    <Container>
      <Skeleton variant="text" sx={{ fontSize: "2.4rem", mb: 2, mt: 4 }} />

      <Grid container spacing={{ xs: 2, md: 6 }}>
        <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
          <Question />
        </Grid>
        <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
          <Skeleton variant="rounded" width={"100%"} height={300} />
        </Grid>
      </Grid>
    </Container>
  );
}
