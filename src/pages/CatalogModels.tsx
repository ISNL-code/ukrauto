import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Model } from "../types/catalog";
import { getModels } from "../services/localCatalogDB";

const CatalogPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getModels().then((data: Model[]) => setModels(data));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        justifyContent: "flex-start",
      }}
    >
      {models.map((model: Model) => (
        <Card
          key={model.id}
          elevation={2}
          sx={{
            width: 280,
            cursor: "pointer",
            borderRadius: 3,
            border: "2px solid #1565c0",
            background: "linear-gradient(145deg, #a8bfd3, #c8e0f8)",
            transition: "transform 0.25s, box-shadow 0.25s",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 5px 5px rgba(0,0,0,0.3)",
            },
          }}
          onClick={() => navigate(`/catalog/${model.id}`)}
        >
          <CardActionArea>
            <CardContent sx={{ py: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,

                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {model.name}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default CatalogPage;
