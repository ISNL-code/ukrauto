import React, { useState, useRef, useEffect } from "react";
import { Model, Aggregate } from "../../../types/catalog";
import {
  List,
  ListItemButton,
  TextField,
  IconButton,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = { AGGREGATE: "aggregate" };

interface AggregatesColumnProps {
  selectedModel: Model | undefined;
  selectedAggregateId: string | null;
  onSelectAggregate: (id: string) => void; // устанавливает выбранный агрегат
  onUpdateAggregateName: (id: string, name: string) => void; // редактирует имя
  onRemoveAggregate: (id: string) => void; // удаляет агрегат
  dropRef: (node: HTMLDivElement | null) => void; // ref для дропа
  addAggregate: (name: string) => string | undefined; // добавляет агрегат
  setModels: React.Dispatch<React.SetStateAction<Model[]>>; // обновление моделей
}

interface AggregateItemProps {
  agg: Aggregate;
  index: number;
  moveAggregate: (fromIndex: number, toIndex: number) => void;
  selectedAggregateId: string | null;
  onSelectAggregate: (id: string) => void;
  onUpdateAggregateName: (id: string, name: string) => void;
  onRemoveAggregate: (id: string) => void;
}

const AggregateItem: React.FC<AggregateItemProps> = ({
  agg,
  index,
  moveAggregate,
  selectedAggregateId,
  onSelectAggregate,
  onUpdateAggregateName,
  onRemoveAggregate,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(agg.name);

  const [, drop] = useDrop<{ index: number }>({
    accept: ItemTypes.AGGREGATE,
    hover(item, monitor) {
      if (!ref.current || isEditing) return;

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

      moveAggregate(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: ItemTypes.AGGREGATE,
    item: { index },
    canDrag: () => !isEditing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  useEffect(() => {
    if (ref.current) drag(drop(ref));
  }, [drag, drop]);

  const handleBlurOrEnter = () => {
    setIsEditing(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== agg.name) {
      onUpdateAggregateName(agg.id, trimmed);
    }
  };

  return (
    <Paper
      ref={ref}
      elevation={1}
      sx={{
        borderRadius: 1,
        p: "4px 6px",
        cursor: isEditing ? "text" : "grab",
        backgroundColor: agg.id === selectedAggregateId ? "#e3f2fd" : "#fff",
        border: agg.id !== selectedAggregateId ? "1px solid #ececec" : "none",
        mb: 1,
      }}
    >
      <ListItemButton
        selected={agg.id === selectedAggregateId}
        onClick={() => onSelectAggregate(agg.id)}
        sx={{ display: "flex", alignItems: "center", gap: 1, p: 0 }}
      >
        {isEditing ? (
          <TextField
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            fullWidth
            size="small"
            variant="standard"
            InputProps={{ sx: { fontSize: 13, py: 0.5 } }}
            onBlur={handleBlurOrEnter}
            onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <Box
            onDoubleClick={() => setIsEditing(true)}
            sx={{
              flex: 1,
              fontSize: 13,
              py: 0.5,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {agg.name}
          </Box>
        )}

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveAggregate(agg.id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    </Paper>
  );
};

export const AggregatesColumn: React.FC<AggregatesColumnProps> = ({
  selectedModel,
  selectedAggregateId,
  onSelectAggregate,
  onUpdateAggregateName,
  onRemoveAggregate,
  dropRef,
  addAggregate,
  setModels,
}) => {
  const [newName, setNewName] = useState("");
  const isDisabled = !selectedModel;

  const moveAggregate = (fromIndex: number, toIndex: number) => {
    if (!selectedModel) return;
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== selectedModel.id) return m;
        const updated = [...m.agregates];
        const [removed] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, removed);
        return { ...m, agregates: updated };
      }),
    );
  };

  return (
    <div
      ref={dropRef}
      style={{
        minWidth: 240,
        maxWidth: 240,
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        height: "100%", // растягиваем на всю высоту
      }}
    >
      {/* Заголовок */}
      <Box p={1} sx={{ mb: 1, borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6" fontWeight={600}>
          Агрегаты
        </Typography>
      </Box>

      {/* Контейнер для добавления + списка */}
      <Box
        p={1}
        sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
      >
        {isDisabled ? (
          <Typography sx={{ fontSize: 12, color: "#666", fontStyle: "italic" }}>
            Выберите модель, чтобы увидеть агрегаты
          </Typography>
        ) : (
          <>
            {/* Добавление нового агрегата */}
            <Paper elevation={0} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                placeholder="Новый агрегат"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: 13, py: 0.5 } }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) {
                    const newId = addAggregate(newName);
                    if (newId) onSelectAggregate(newId);
                    setNewName("");
                  }
                }}
              />
              <IconButton
                disabled={!newName.trim()}
                color="primary"
                size="small"
                onClick={() => {
                  if (!newName.trim()) return;
                  const newId = addAggregate(newName);
                  if (newId) onSelectAggregate(newId);
                  setNewName("");
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Paper>

            {/* Список агрегатов с прокруткой */}
            <List sx={{ flex: 1, overflowY: "auto", padding: 0, minHeight: 0 }}>
              {selectedModel?.agregates.map((agg, index) => (
                <AggregateItem
                  key={agg.id}
                  agg={agg}
                  index={index}
                  moveAggregate={moveAggregate}
                  selectedAggregateId={selectedAggregateId}
                  onSelectAggregate={onSelectAggregate}
                  onUpdateAggregateName={onUpdateAggregateName}
                  onRemoveAggregate={onRemoveAggregate}
                />
              ))}
            </List>
          </>
        )}
      </Box>
    </div>
  );
};
