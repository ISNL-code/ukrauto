import React from "react";
import { Node, Part, PdfPage } from "../../../types/catalog";
import { Box, Typography } from "@mui/material";
import { PartsImagesColumn } from "./PartsImagesColumn";
import { PartsTableColumn } from "./PartsTableColumn";

interface PartsColumnProps {
  selectedNode?: Node;
  onAddParts: (
    parts: Omit<Part, "id">[],
    sourcePage?: PdfPage | undefined,
  ) => void;
  onUpdatePart: (partId: string, patch: Partial<Part>) => void;
  onRemovePart: (partId: string) => void;
  removePartsByPage: (pageId: string) => void;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;
  addImagesToNode: (images: string[]) => void;
}

export const PartsColumn: React.FC<PartsColumnProps> = ({
  selectedNode,
  onAddParts,
  onUpdatePart,
  onRemovePart,
  removePartsByPage,
  setPages,
  addImagesToNode,
}) => {
  return (
    <div
      style={{
        minWidth: 700,
        maxWidth: 700,
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
      }}
    >
      {/* Header */}
      <Box p={1} sx={{ mb: 1, borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6" fontWeight={600}>
          Запчасти
        </Typography>
      </Box>

      {/* Верхняя зона — изображения */}
      <PartsImagesColumn
        selectedNode={selectedNode}
        addImagesToNode={addImagesToNode}
        setPages={setPages}
      />

      {/* Нижняя зона — таблица деталей */}
      <PartsTableColumn
        selectedNode={selectedNode}
        onAddParts={onAddParts}
        onRemovePartsByPage={removePartsByPage}
        onUpdatePart={onUpdatePart}
        onRemovePart={onRemovePart}
        setPages={setPages}
      />
    </div>
  );
};
