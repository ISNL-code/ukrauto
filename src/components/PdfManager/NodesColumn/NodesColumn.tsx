import React, { useState, useRef } from "react";
import { Aggregate, Model, Node } from "../../../types/catalog";
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

const ItemTypes = { NODE: "node" };

interface NodesColumnProps {
  selectedAggregate?: Aggregate;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onUpdateNodeName: (id: string, name: string) => void;
  onRemoveNode: (id: string) => void;
  dropRef: (node: HTMLDivElement | null) => void;
  addNode: (name: string) => string | undefined;
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
}

interface NodeItemProps {
  node: Node;
  index: number;
  moveNode: (fromIndex: number, toIndex: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onUpdateNodeName: (id: string, name: string) => void;
  onRemoveNode: (id: string) => void;
}

const NodeItem: React.FC<NodeItemProps> = ({
  node,
  index,
  moveNode,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeName,
  onRemoveNode,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const [, drop] = useDrop<{ index: number }>({
    accept: ItemTypes.NODE,
    hover(item, monitor) {
      if (!ref.current || isEditing) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveNode(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE,
    item: { index },
    canDrag: () => !isEditing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  React.useEffect(() => {
    if (ref.current) drag(drop(ref));
  }, [drag, drop]);

  const handleBlurOrEnter = () => {
    setIsEditing(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== node.name) {
      onUpdateNodeName(node.id, trimmed);
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
        backgroundColor: node.id === selectedNodeId ? "#e3f2fd" : "#fff",
        border: node.id !== selectedNodeId ? "1px solid #ececec" : "none",
        mb: 1,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <ListItemButton
        selected={node.id === selectedNodeId}
        onClick={() => onSelectNode(node.id)}
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
            {node.name}
          </Box>
        )}

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveNode(node.id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
    </Paper>
  );
};

export const NodesColumn: React.FC<NodesColumnProps> = ({
  selectedAggregate,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeName,
  onRemoveNode,
  dropRef,
  addNode,
  setModels,
}) => {
  const [newName, setNewName] = useState("");
  const isDisabled = !selectedAggregate;

  const moveNode = (fromIndex: number, toIndex: number) => {
    if (!selectedAggregate) return;

    setModels((prev: Model[]) =>
      prev.map((m) => {
        if (!m.agregates.some((a) => a.id === selectedAggregate.id)) return m;

        return {
          ...m,
          agregates: m.agregates.map((a) => {
            if (a.id !== selectedAggregate.id) return a;

            const updatedNodes = [...a.node];
            const [removed] = updatedNodes.splice(fromIndex, 1);
            updatedNodes.splice(toIndex, 0, removed);

            return { ...a, node: updatedNodes };
          }),
        };
      }),
    );
  };

  return (
    <div
      ref={dropRef}
      style={{
        minWidth: 260,
        maxWidth: 260,
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        height: "100%", // <-- растягиваем на всю доступную высоту
      }}
    >
      {/* Заголовок */}
      <Box p={1} sx={{ mb: 1, borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6" fontWeight={600}>
          Узлы
        </Typography>
      </Box>

      {/* Контейнер для добавления узлов + список */}
      <Box
        p={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0, // важно для flex + overflow
        }}
      >
        {isDisabled ? (
          <Typography sx={{ fontSize: 12, color: "#666", fontStyle: "italic" }}>
            Выберите агрегат, чтобы увидеть узлы
          </Typography>
        ) : (
          <>
            {/* Добавление нового узла */}
            <Paper elevation={0} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                placeholder="Новый узел"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: 13, py: 0.5 } }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) {
                    const newId = addNode(newName);
                    if (newId) onSelectNode(newId);
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
                  const newId = addNode(newName);
                  if (newId) onSelectNode(newId);
                  setNewName("");
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Paper>

            {/* Список узлов */}
            <List
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: 0,
                minHeight: 0, // важно для корректного скролла
              }}
            >
              {selectedAggregate.node.map((node, index) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  index={index}
                  moveNode={moveNode}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onUpdateNodeName={onUpdateNodeName}
                  onRemoveNode={onRemoveNode}
                />
              ))}
            </List>
          </>
        )}
      </Box>
    </div>
  );
};
