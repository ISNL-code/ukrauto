import { Model } from "../../../types/catalog";
import {
  AppBar,
  Toolbar,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

interface ModelHeaderProps {
  modelName: string;
  setModelName: (v: string) => void;

  selectedModelId: string | null;
  setSelectedModelId: (v: string | null) => void;

  models: Model[];

  saveModel: () => void;
  deleteModel: (id: string) => void;
  renameModel: (id: string, name: string) => void;
}

export const ModelHeader: React.FC<ModelHeaderProps> = ({
  modelName,
  setModelName,
  selectedModelId,
  setSelectedModelId,
  models,
  saveModel,
  deleteModel,
  renameModel,
}) => {
  const navigate = useNavigate(); // хук для навигации
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const isNewModel = !selectedModelId;

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1, padding: "8px !important" }}>
        <Select
          size="small"
          displayEmpty
          value={selectedModelId || ""}
          onChange={(e) => setSelectedModelId(e.target.value || null)}
          sx={{ minWidth: 180, height: 34 }}
        >
          <MenuItem value="">
            <span>Добавить модель</span>
          </MenuItem>
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          sx={{
            minWidth: 180,
            "& .MuiOutlinedInput-root": {
              height: 34,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiOutlinedInput-input": {
              padding: "0 12px",
              fontSize: 14,
            },
            "& .MuiInputLabel-root": {
              fontSize: 12,
              transform: "translate(14px, 9px) scale(1)",
              transformOrigin: "top left",
            },
            "& .MuiInputLabel-root.MuiInputLabel-shrink": {
              transform: "translate(14px, -6px) scale(1)",
            },
          }}
          size="small"
          label="Имя модели"
          value={isNewModel ? modelName : selectedModel?.name || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (isNewModel) {
              setModelName(value);
            } else if (selectedModelId) {
              renameModel(selectedModelId, value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (isNewModel && modelName.trim()) {
                saveModel();
              } else if (
                !isNewModel &&
                selectedModelId &&
                selectedModel?.name
              ) {
                renameModel(selectedModelId, selectedModel.name);
              }
              e.preventDefault(); // чтобы Enter не срабатывал как сабмит формы
            }
          }}
        />

        {isNewModel ? (
          <Button
            variant="outlined"
            onClick={saveModel}
            disabled={!modelName.trim()}
            size="small"
            startIcon={<AddOutlinedIcon />}
          >
            Добавить
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => selectedModelId && deleteModel(selectedModelId)}
            size="small"
          >
            Удалить
          </Button>
        )}
        <Box sx={{ marginLeft: "auto", gap: 1, display: "flex" }}>
          {/* Кнопка Сохранить - но пока не используем */}
          {/* <Button
            sx={{ marginLeft: "auto" }}
            onClick={() => navigate("/")}
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
          >
            Сохранить
          </Button> */}
          {/* Кнопка Назад */}

          <Tooltip title="Выйти">
            <IconButton
              size="small"
              onClick={() => navigate("/")}
              sx={{
                borderRadius: "4px",
                width: 32,
                height: 32,
                backgroundColor: "error.main",
                color: "error.contrastText",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
