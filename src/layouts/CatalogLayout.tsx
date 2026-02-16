import { useEffect, useMemo, useState } from "react";
import Header, { SearchOption } from "../components/Header";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Model, Aggregate, Node } from "../types/catalog";
import { getModels } from "../services/localCatalogDB";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";

interface CatalogLayoutProps {
  isLoggedIn: boolean;
  onLogin: (password: string) => void;
  onLogout: () => void;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({
  isLoggedIn,
  onLogin,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { modelId, nodeId } = useParams<{
    modelId?: string;
    nodeId?: string;
  }>();

  const [models, setModels] = useState<Model[]>([]);
  const [highlightPart, setHighlightPart] = useState<string | null>(null);

  useEffect(() => {
    getModels().then(setModels);
  }, []);

  const allParts: SearchOption[] = useMemo(() => {
    const result: SearchOption[] = [];
    models.forEach((model) =>
      model.agregates.forEach((ag) =>
        ag.node.forEach((node) =>
          node.parts?.forEach((part) => {
            result.push({
              label: String(part.partNumber),
              modelId: model.id,
              nodeId: node.id,
              partId: part.id,
            });
            part.alternatePartNumbers?.forEach((alt) =>
              result.push({
                label: String(alt),
                modelId: model.id,
                nodeId: node.id,
                partId: part.id,
              }),
            );
          }),
        ),
      ),
    );
    return result;
  }, [models]);

  const model = models.find((m) => m.id === modelId);

  let aggregate: Aggregate | undefined;
  let node: Node | undefined;

  if (model) {
    for (const ag of model.agregates) {
      const foundNode = ag.node.find((n) => n.id === nodeId);
      if (foundNode) {
        aggregate = ag;
        node = foundNode;
        break;
      }
    }
  }

  return (
    <Box>
      <Header
        allParts={allParts}
        highlightPart={highlightPart}
        setHighlightPart={setHighlightPart}
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          mt: 1,
          ml: 3,
          fontSize: "0.95rem", // чуть аккуратнее
          "& .MuiTypography-root": {
            color: "text.primary",
            fontWeight: 500,
          },
        }}
      >
        {/* Каталог */}
        <Link
          underline="hover"
          color="#1976d2 !important" // <-- явный синий цвет
          sx={{ cursor: "pointer", fontWeight: 500 }}
          onClick={() => navigate("/catalog")}
        >
          Модели
        </Link>

        {/* Модель */}
        {model &&
          (!node ? (
            <Typography>{model.name}</Typography>
          ) : (
            <Link
              underline="hover"
              color="#1976d2 !important" // <-- явный синий цвет
              sx={{ cursor: "pointer", fontWeight: 500 }}
              onClick={() => navigate(`/catalog/${model.id}`)}
            >
              {model.name}
            </Link>
          ))}

        {/* Узел */}
        {model && node && (
          <Typography>
            {aggregate ? `${aggregate.name} — ${node.name}` : node.name}
          </Typography>
        )}
      </Breadcrumbs>

      <Box sx={{ mt: 4, px: 2 }}>
        <Outlet context={{ highlightPart }} />
      </Box>
    </Box>
  );
};
