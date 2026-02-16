import { Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Model } from "../types/catalog";

const ModelCard = ({ model }: { model: Model }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{ cursor: "pointer", height: "100%" }}
      onClick={() => navigate(`/catalog/${model.id}`)}
    >
      <CardContent>
        <Typography variant="h6">{model.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {model.agregates.length} агрегатов
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ModelCard;
