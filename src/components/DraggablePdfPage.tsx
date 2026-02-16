import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

/* ================== PDF Page ================== */
interface PdfPage {
  id: string;
  text: string;
  img: string;
}

/* ================== DnD ================== */
const ItemTypes = {
  PAGE: "page",
};

export const DraggablePdfPage: React.FC<{
  page: PdfPage;
  index: number;
  movePage: (from: number, to: number) => void;
  removePage: (id: string) => void;
}> = ({ page, index, movePage, removePage }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.PAGE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const rect = ref.current.getBoundingClientRect();
      const middleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - rect.top;

      if (dragIndex < hoverIndex && hoverY < middleY) return;
      if (dragIndex > hoverIndex && hoverY > middleY) return;

      movePage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: ItemTypes.PAGE,
    item: { index, page },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Paper
      ref={ref}
      elevation={1}
      sx={{
        position: "relative",
        padding: 1,
        mb: 1.5,
        cursor: "move",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
      }}
    >
      {/* Кнопка удаления через MUI */}
      <IconButton
        size="large"
        onClick={() => removePage(page.id)}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          p: 0.5,
          color: "error.main",
        }}
        aria-label="Удалить страницу"
      >
        <DeleteIcon fontSize="medium" />
      </IconButton>

      <p>Страница {index + 1}</p>
      <img
        src={page.img}
        style={{ width: "100%", marginTop: 6, borderRadius: 4 }}
        alt=""
      />
      {/* <p style={{ fontSize: 12, whiteSpace: "pre-wrap", marginTop: 4 }}>
        {page.text}
      </p> */}
    </Paper>
  );
};
