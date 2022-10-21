import Head from "next/head";
import Link from "next/link";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import { trpc } from "@/utils/trpc";

const FreeTrial = () => {
  const { data: sets, isLoading } = trpc.useQuery(["questionset.free-trial"]);
  console.log(sets);

  return (
    <>
      <Head>
        <title>Free Trial | Onushilonik</title>
      </Head>
      <Box sx={{ my: 4 }}>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom>
            Free Trial
          </Typography>
          {isLoading ? (
            <LinearProgress />
          ) : (
            <Grid container>
              {sets?.map((set) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={set.id}
                  sx={{ my: 2 }}
                >
                  <Link href={"/app/free-trial/" + set.id}>
                    <Card component={"a"} sx={{ display: "block" }}>
                      <CardActionArea>
                        <CardContent sx={{ display: "flex" }}>
                          <Box>
                            <Typography
                              variant="h5"
                              component="h2"
                              gutterBottom
                            >
                              {set.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              total questions: {set._count.questions}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default FreeTrial;
