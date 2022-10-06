import NextLink from "next/link";
import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Home = () => {
  return (
    <>
      <Head>
        <title>Home | Onushilonik</title>
      </Head>
      <Container>
        <Box sx={{ my: 4 }}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                ফ্রী ট্রায়াল শুরু করুন
              </Typography>
              <NextLink passHref href="/app/free-trial">
                <Button
                  component={"a"}
                  disableElevation
                  size="large"
                  variant="contained"
                >
                  ফ্রী ট্রায়াল
                </Button>
              </NextLink>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
};
export default Home;
