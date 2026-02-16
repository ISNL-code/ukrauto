import { useCallback, useEffect } from "react";
import { Model, Part, PdfPage } from "../../../types/catalog";
import { v4 as uuidv4 } from "uuid";

interface UsePartsProps {
  selectedModel?: Model;
  selectedModelId: string | null;
  selectedAggregateId: string | null;
  selectedNodeId: string | null;

  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;

  saveModel: (model: Model) => void; // 👈 приходит сверху
}

export const useParts = ({
  selectedModel,
  selectedModelId,
  selectedAggregateId,
  selectedNodeId,
  setModels,
  setPages,
  saveModel,
}: UsePartsProps) => {
  /* ================== Автосохранение в IndexedDB ================== */
  useEffect(() => {
    if (selectedModel) {
      saveModel(selectedModel);
    }
  }, [selectedModel, saveModel]);

  /* ================== Add Parts ================== */
  const addParts = useCallback(
    (parts: Omit<Part, "id">[], sourcePage?: PdfPage) => {
      if (!selectedModelId || !selectedAggregateId || !selectedNodeId) return;
      if (parts.length === 0 && !sourcePage) return;

      setModels((prevModels) =>
        prevModels.map((m) => {
          if (m.id !== selectedModelId) return m;

          return {
            ...m,
            agregates: m.agregates.map((a) => {
              if (a.id !== selectedAggregateId) return a;

              return {
                ...a,
                node: a.node.map((n) => {
                  if (n.id !== selectedNodeId) return n;

                  const newParts: Part[] = parts.map((p) => ({
                    id: uuidv4(),
                    ...p,
                  }));

                  return {
                    ...n,
                    parts: [...(n.parts ?? []), ...newParts],
                    _pages: sourcePage
                      ? [...(n._pages ?? []), sourcePage]
                      : (n._pages ?? []),
                  };
                }),
              };
            }),
          };
        }),
      );

      if (sourcePage) {
        setPages((prev) => prev.filter((p) => p.id !== sourcePage.id));
      }
    },
    [selectedModelId, selectedAggregateId, selectedNodeId, setModels, setPages],
  );

  /* ================== Update Part ================== */
  const updatePart = useCallback(
    (partId: string, patch: Partial<Part>) => {
      if (!selectedModelId || !selectedAggregateId || !selectedNodeId) return;

      setModels((prevModels) =>
        prevModels.map((m) => {
          if (m.id !== selectedModelId) return m;

          return {
            ...m,
            agregates: m.agregates.map((a) => {
              if (a.id !== selectedAggregateId) return a;

              return {
                ...a,
                node: a.node.map((n) => {
                  if (n.id !== selectedNodeId) return n;

                  return {
                    ...n,
                    parts: n.parts?.map((p) =>
                      p.id === partId ? { ...p, ...patch } : p,
                    ),
                  };
                }),
              };
            }),
          };
        }),
      );
    },
    [selectedModelId, selectedAggregateId, selectedNodeId, setModels],
  );

  /* ================== Remove Part ================== */
  const removePart = useCallback(
    (partId: string) => {
      if (!selectedModelId) return;

      setModels((prevModels) =>
        prevModels.map((m) => {
          if (m.id !== selectedModelId) return m;

          return {
            ...m,
            agregates: m.agregates.map((a) => ({
              ...a,
              node: a.node.map((n) => ({
                ...n,
                parts: n.parts?.filter((p) => p.id !== partId) ?? [],
              })),
            })),
          };
        }),
      );
    },
    [selectedModelId, setModels],
  );

  /* ================== Remove Parts By Page ================== */
  const removePartsByPage = useCallback(
    (pageId: string) => {
      const pagesToReturn: PdfPage[] = [];
      const addedPageIds = new Set<string>();

      setModels((prevModels) =>
        prevModels.map((m) => {
          if (m.id !== selectedModelId) return m;

          return {
            ...m,
            agregates: m.agregates.map((a) => ({
              ...a,
              node: a.node.map((n) => {
                const page = n._pages?.find((p) => p.id === pageId);

                if (page && !addedPageIds.has(page.id)) {
                  if (!page.id.startsWith("manual-")) {
                    pagesToReturn.push(page);
                    addedPageIds.add(page.id);
                  }
                }

                return {
                  ...n,
                  parts:
                    n.parts?.filter((p) => p.sourcePage?.id !== pageId) ?? [],
                  _pages: n._pages?.filter((p) => p.id !== pageId) ?? [],
                };
              }),
            })),
          };
        }),
      );

      if (pagesToReturn.length) {
        setPages((prev) => [
          ...pagesToReturn.filter((p) => !prev.find((x) => x.id === p.id)),
          ...prev,
        ]);
      }
    },
    [selectedModelId, setModels, setPages],
  );

  /* ================== Add Images ================== */
  const addImagesToNode = useCallback(
    (images: string[]) => {
      if (!selectedModelId || !selectedAggregateId || !selectedNodeId) return;

      setModels((prevModels) =>
        prevModels.map((m) => {
          if (m.id !== selectedModelId) return m;

          return {
            ...m,
            agregates: m.agregates.map((a) => {
              if (a.id !== selectedAggregateId) return a;

              return {
                ...a,
                node: a.node.map((n) => {
                  if (n.id !== selectedNodeId) return n;

                  return {
                    ...n,
                    img: [...(n.img ?? []), ...images],
                  };
                }),
              };
            }),
          };
        }),
      );
    },
    [selectedModelId, selectedAggregateId, selectedNodeId, setModels],
  );

  return {
    addParts,
    updatePart,
    removePart,
    removePartsByPage,
    addImagesToNode,
  };
};
