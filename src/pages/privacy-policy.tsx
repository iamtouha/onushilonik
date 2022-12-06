import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import StaticpageLayout from "@/layouts/StaticpageLayout";
import type { NextPageWithLayout } from "./_app";

const PrivacyPolicy: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | Onushilonic</title>
      </Head>
      <Container sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Privacy Policy
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Facere
          incidunt facilis laborum tenetur impedit ullam error, excepturi
          provident tempore? Iusto porro tenetur cumque assumenda tempora
          delectus ex quo animi iste! Facilis assumenda cupiditate quidem
          aperiam est esse placeat adipisci dicta iusto odit, debitis aliquam
          dolorum non omnis ipsa voluptatibus explicabo. Placeat praesentium
          excepturi magni aspernatur asperiores incidunt harum cum inventore!
          Cum ipsa soluta iusto iure architecto blanditiis nostrum dolorum dolor
          eaque. Quos, labore dolor nesciunt non vel, suscipit magnam soluta
          optio cum nobis iste a dolore molestias vitae voluptatum. Iure.
          Consequuntur atque ullam magnam qui exercitationem, quaerat minus quod
          fugit eaque placeat optio voluptatibus accusantium! Deleniti excepturi
          quam, sequi doloribus itaque voluptatem. Deleniti suscipit quod nam
          fuga soluta? Eum, vel. Repudiandae excepturi alias autem? Vel unde
          atque minima, repellendus, tempora placeat hic doloribus quasi autem
          alias praesentium fugiat, et quo. Voluptatum, illum modi eaque
          possimus deserunt fugiat deleniti vel suscipit?
        </Typography>
      </Container>
    </>
  );
};

PrivacyPolicy.getLayout = (page) => <StaticpageLayout>{page}</StaticpageLayout>;

export default PrivacyPolicy;
