import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import type { Node, Model } from "../types/catalog";
import { getModels } from "../services/localCatalogDB";

const NodePage: React.FC = () => {
  const { modelId, nodeId } = useParams<{ modelId: string; nodeId: string }>();
  const [model, setModel] = useState<Model | null>(null);
  const [node, setNode] = useState<Node | null>(null);
  const [aggregateName, setAggregateName] = useState("");
  const [loading, setLoading] = useState(true);
  const { highlightPart } = useOutletContext<{
    highlightPart: string | null;
  }>();
  useEffect(() => {
    if (!modelId || !nodeId) return;

    setLoading(true);

    getModels()
      .then((models) => {
        const foundModel = models.find((m) => m.id === modelId);
        setModel(foundModel || null);

        if (!foundModel) return;

        for (const ag of foundModel.agregates) {
          const foundNode = ag.node.find((n) => n.id === nodeId);
          if (foundNode) {
            setNode(foundNode);
            setAggregateName(ag.name);
            break;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [modelId, nodeId]);

  if (!modelId || !nodeId) {
    return <Typography>Узел не выбран</Typography>;
  }

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!model) {
    return <Typography>Модель не найдена</Typography>;
  }

  if (!node) {
    return <Typography>Узел не найден</Typography>;
  }

  const parts = node.parts ?? [];

  return (
    <Box sx={{ p: 1, height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Узел: {node.name}
      </Typography>

      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Агрегат: {aggregateName}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
        {/* ЛЕВАЯ КОЛОНКА: ЗАПЧАСТИ */}
        <Paper elevation={0} sx={{ p: 2, flex: 1, overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Запчасти
          </Typography>

          {parts.length === 0 ? (
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              В этом узле нет запчастей
            </Typography>
          ) : (
            <Table size="small" sx={{ maxWidth: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Part №</TableCell>
                  <TableCell>Описание RU</TableCell>
                  <TableCell>Описание UK</TableCell>
                  <TableCell align="center">Кол-во</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id} hover>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      {part.schemeNumber}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "monospace",
                        backgroundColor:
                          highlightPart === part.id
                            ? "rgba(255,200,0,0.3)"
                            : undefined,
                      }}
                    >
                      {part.partNumber}
                      {part.alternatePartNumbers &&
                        part.alternatePartNumbers?.length > 0 && (
                          <Box component="div" sx={{ color: "green", mt: 0.5 }}>
                            {part.alternatePartNumbers.map((alt, i) => (
                              <div key={i}>{alt}</div>
                            ))}
                          </Box>
                        )}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      {part.descriptionRu}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      {part.descriptionUk}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }} align="center">
                      {part.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* ПРАВАЯ КОЛОНКА: СХЕМЫ */}
        {(node.img ?? []).length > 0 && (
          <Paper
            elevation={0}
            sx={{ width: 900, overflowY: "auto", flexShrink: 0 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(node.img ?? []).map((src, index) => (
                <Box key={index} sx={{ overflow: "hidden" }}>
                  <img
                    src={src}
                    alt={`node-scheme-${index}`}
                    style={{
                      width: "100%",
                      objectFit: "contain",
                      display: "block",
                      scale: "1.1",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default NodePage;
