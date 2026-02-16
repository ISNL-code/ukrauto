import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import type { Model, Node, Aggregate } from "../types/catalog";
import { getModels } from "../services/localCatalogDB";

const ModelPage: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modelId) return;

    setLoading(true);
    getModels()
      .then((models) => {
        const foundModel = models.find((m: Model) => m.id === modelId) || null;
        setModel(foundModel);
      })
      .finally(() => setLoading(false));
  }, [modelId]);

  if (!modelId) return <Typography>Модель не выбрана</Typography>;
  if (loading) return <Typography>Загрузка...</Typography>;
  if (!model) return <Typography>Модель не найдена</Typography>;

  return (
    <Box
      sx={{ p: 3, display: "flex", justifyContent: "center", width: "100%" }}
    >
      <Box sx={{ width: "100%", maxWidth: 700 }}>
        <Typography variant="h4" gutterBottom>
          Модель: {model.name}
        </Typography>

        {model.agregates.length === 0 && (
          <Typography color="text.secondary">Агрегаты отсутствуют</Typography>
        )}

        {model.agregates.map((ag: Aggregate) => (
          <Accordion key={ag.id} disableGutters sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                fontWeight={600}
                sx={{ color: "#0D47A1", fontSize: 16 }}
              >
                {ag.name}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              {ag.node.length === 0 ? (
                <Typography sx={{ p: 2, color: "text.secondary" }}>
                  Узлы отсутствуют
                </Typography>
              ) : (
                <List sx={{ p: 0 }} dense>
                  {ag.node.map((node: Node) => (
                    <ListItemButton
                      key={node.id}
                      onClick={() =>
                        navigate(`/catalog/${model.id}/node/${node.id}`)
                      }
                      sx={{
                        "&:hover": { backgroundColor: "#E3F2FD" },
                        borderTop: "1px solid #c0c0c0",
                      }}
                    >
                      <ListItemText
                        primary={node.name}
                        primaryTypographyProps={{ color: "text.primary" }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default ModelPage;
