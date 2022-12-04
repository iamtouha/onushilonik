import { useAutoAnimate } from "@formkit/auto-animate/react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type OrderListProps = {
  items: { code: string; stem: string; id: string }[];
  onRemove: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
};

const OrderList = (props: OrderListProps) => {
  const [parent] = useAutoAnimate<HTMLUListElement>();
  return (
    <List dense ref={parent}>
      {props.items.map((question, i) => (
        <ListItem key={question.id}>
          <IconButton
            size="small"
            aria-label={"move up"}
            onClick={() => props.moveUp(question.id)}
            disabled={i === 0}
          >
            <KeyboardArrowUpIcon />
          </IconButton>

          <IconButton
            size="small"
            sx={{ mr: 2 }}
            aria-label={"move down"}
            onClick={() => props.moveDown(question.id)}
            disabled={props.items.length === i + 1}
          >
            <KeyboardArrowDownIcon />
          </IconButton>

          <ListItemText
            primary={`${i + 1}) ${question.code}`}
            secondary={
              <span
                title={question.stem}
                style={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {question.stem}
              </span>
            }
          />

          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => props.onRemove(question.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {props.items.length === 0 && (
        <ListItem>
          <ListItemText
            primary="No questions added yet"
            secondary="Add questions from the left panel"
          />
        </ListItem>
      )}
    </List>
  );
};

export default OrderList;
