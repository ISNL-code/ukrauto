import React, { forwardRef, useRef } from "react";
import { useDrop } from "react-dnd";
import { DraggablePdfPage } from "../../DraggablePdfPage";
import { PdfPage } from "../../../types/catalog";
import { Box, Paper, Typography, Button } from "@mui/material";

interface PdfPagesPanelProps {
  pages: PdfPage[];
  movePage: (from: number, to: number) => void;
  removePage: (id: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const PdfPagesPanel = forwardRef<HTMLDivElement, PdfPagesPanelProps>(
  ({ pages, movePage, removePage, handleFileChange, loading }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // DnD drop
    const [, drop] = useDrop({
      accept: "page",
      drop: (item: any) => {
        return item;
      },
    });

    // Скролл вверх только если страниц стало больше позже
    // useEffect(() => {
    //   if (containerRef.current && pages.length > prevLengthRef.current) {
    //     containerRef.current.scrollTop = 0;
    //   }
    //   prevLengthRef.current = pages.length;
    // }, [pages.length]);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          drop(node);
        }}
        style={{
          width: "100%",
          borderLeft: "1px solid #ddd",
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          padding: 8,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          alignItems: "center",
        }}
      >
        {/* Загрузка файла */}
        {!loading && pages.length === 0 && (
          <Box
            sx={{
              width: 220,
              mb: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
              Загрузите PDF
            </Typography>
            <Button
              variant="outlined"
              size="small"
              component="label"
              sx={{ fontSize: 12 }}
            >
              Выбрать файл
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        )}

        {/* Лоадер */}
        {loading && (
          <Typography variant="body2" sx={{ textAlign: "center", my: 1 }}>
            Загрузка PDF...
          </Typography>
        )}

        {/* Список страниц */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
          {pages.map((page, index) => (
            <Paper
              key={page.id}
              elevation={1}
              sx={{
                p: 1,
                borderRadius: 2,
                cursor: "grab",
                fontSize: 13,
              }}
            >
              <DraggablePdfPage
                page={page}
                index={index}
                movePage={movePage}
                removePage={removePage}
              />
            </Paper>
          ))}
        </Box>
      </div>
    );
  },
);

PdfPagesPanel.displayName = "PdfPagesPanel";
