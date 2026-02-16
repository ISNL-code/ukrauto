import React, { useRef } from "react";
import { Node, PdfPage } from "../../../types/catalog";
import { Box, Paper, Typography } from "@mui/material";
import { useDrop } from "react-dnd";

interface PartsImagesColumnProps {
  selectedNode?: Node;
  addImagesToNode: (images: string[]) => void;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;
}

export const PartsImagesColumn: React.FC<PartsImagesColumnProps> = ({
  selectedNode,
  addImagesToNode,
  setPages,
}) => {
  const images = selectedNode?.img ?? [];
  const imagesRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, dropImages] = useDrop({
    accept: ["imagePage", "page"],
    drop: (item: any) => {
      if (!selectedNode) return;

      const page: PdfPage = item.page;

      // Берём текущее состояние img и добавляем новое
      if (page.img) {
        addImagesToNode([page.img]);
      }

      setPages((prev) => prev.filter((p) => p.id !== page.id));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <Box
      ref={(node) => {
        const el = node as HTMLDivElement | null;
        imagesRef.current = el;
        if (el) dropImages(el);
      }}
      sx={{
        display: "flex",
        gap: 1,
        p: 1,
        overflowX: "auto",
        borderBottom: "1px solid #eee",
        minHeight: 120,
        background: selectedNode
          ? isOver && canDrop
            ? "#e0f7fa"
            : "#fafafa"
          : "#f5f5f5",
      }}
    >
      {images.map((src, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{
            p: 0.5,
            flex: "0 0 auto",
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <img
            src={src}
            alt={`image-${index}`}
            style={{ maxWidth: 150, display: "block" }}
          />
        </Paper>
      ))}

      {images.length === 0 && (
        <Typography sx={{ fontSize: 12, color: "#666" }}>
          {selectedNode
            ? "Перетащите изображения или PDF сюда"
            : "Сначала выберите узел, чтобы добавлять изображения"}
        </Typography>
      )}
    </Box>
  );
};
