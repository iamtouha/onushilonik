import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const ShortNote = ({ content }: { content: string }) => {
  return (
    <Box
      sx={{
        "& img": {
          width: "100%",
          height: "auto",
          display: "block",
          margin: "auto",
          maxWidth: 600,
        },
        "& table, & th, & td": {
          borderCollapse: "collapse",
          border: 1,
        },
        "& th, & td": {
          padding: "2px 8px",
        },
      }}
    >
      <ReactMarkdown rehypePlugins={[remarkGfm, rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default ShortNote;
