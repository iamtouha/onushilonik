import { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { trpc } from "@/utils/trpc";
import { toast } from "react-toastify";
import { formatDistance } from "date-fns";
import { useSession } from "next-auth/react";

type CommentsProps = {
  questionId: string;
};

const Comments = (props: CommentsProps) => {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const {
    data: comments,
    isLoading,
    refetch,
  } = trpc.comments.get.useQuery(props.questionId, {
    refetchOnWindowFocus: false,
  });
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });
  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });
  return (
    <Paper sx={{ p: 1, mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          placeholder={"Write a comment"}
          value={content}
          size="small"
          sx={{ flex: 1 }}
          inputProps={{ maxLength: 128 }}
          onChange={(e) => setContent(e.target.value)}
        />
        <IconButton
          color="primary"
          sx={{ ml: 1 }}
          disabled={createCommentMutation.isLoading || !content.length}
          onClick={() =>
            createCommentMutation.mutate({
              questionId: props.questionId,
              content,
            })
          }
        >
          <SendIcon />
        </IconButton>
      </Box>
      {isLoading && (
        <Stack sx={{ mt: 2, px: 2 }}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width={100} />
        </Stack>
      )}
      <List>
        {comments?.length === 0 ? (
          <ListItem>
            <ListItemText secondary={<i>No comments found.</i>} />
          </ListItem>
        ) : null}
        {comments?.map((comment) => (
          <ListItem key={comment.id}>
            <ListItemText
              secondary={
                <>
                  <Typography
                    variant="body2"
                    component="span"
                    color="text.primary"
                    sx={{ display: "inline" }}
                  >
                    {comment.content}
                  </Typography>
                  {" - "}
                  {comment.profile.fullName}
                  <br />
                  <Typography component="span" variant="caption">
                    {formatDistance(comment.createdAt, Date.now(), {
                      addSuffix: true,
                    })}
                  </Typography>
                </>
              }
            />

            {session?.user?.profileId === comment.profileId ? (
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleteCommentMutation.isLoading}
                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            ) : null}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
export default Comments;
