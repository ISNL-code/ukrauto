import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { Aggregate, Model, Node, PdfPage } from "../../../types/catalog";
import { useEffect } from "react";

interface UseNodesProps {
  selectedModelId: string | null;
  selectedAggregate?: Aggregate;
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;
  setSelectedNodeId: (id: string | null) => void;
  saveModel: (model: Model) => void; // приходит сверху
  selectedModel?: Model; // нужно для сохранения в DB
}

export const useNodes = ({
  selectedModelId,
  selectedAggregate,
  selectedModel,
  setModels,
  setPages,
  setSelectedNodeId,
  saveModel,
}: UseNodesProps) => {
  /* ================== Сохраняем модель при изменениях ================== */
  // Сохраняем только если есть выбранная модель
  useEffect(() => {
    if (selectedModel) {
      saveModel(selectedModel);
    }
  }, [selectedModel, saveModel]);

  /* ================== Add Node ================== */
  const addNode = (
    page?: PdfPage,
    name?: string | null,
    type?: "drop" | "manual",
  ): string | null => {
    if (!selectedModelId || !selectedAggregate) return null;

    const newNodeId = uuidv4();
    const nodeName =
      (page?.text?.replace(/\s+/g, " ").trim() || name || "").trim() ||
      "Новый узел";

    const newNode: Node = {
      id: newNodeId,
      name: nodeName,
      parts: [],
      img: page?.img ? [page.img] : [],
      fromPdf: type === "drop",
      _pages: [],
    };

    setModels((prev) =>
      prev.map((model) =>
        model.id !== selectedModelId
          ? model
          : {
              ...model,
              agregates: model.agregates.map((agg) =>
                agg.id !== selectedAggregate.id
                  ? agg
                  : { ...agg, node: [...agg.node, newNode] },
              ),
            },
      ),
    );

    if (page) {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    }

    setSelectedNodeId(newNodeId);
    return newNodeId;
  };

  /* ================== Remove Node ================== */
  const removeNode = (nodeId: string) => {
    if (!selectedModelId || !selectedAggregate) return;

    const pagesToReturn: PdfPage[] = [];
    const addedPageIds = new Set<string>();

    const updatedNodes = selectedAggregate.node.filter((n) => {
      if (n.id === nodeId) {
        if (n.fromPdf) {
          n.img?.forEach((image) => {
            if (!addedPageIds.has(image)) {
              pagesToReturn.push({
                id: uuidv4(),
                text: n.name,
                img: image,
              });
              addedPageIds.add(image);
            }
          });
        }

        n.parts?.forEach((p) => {
          if (p.sourcePage && !addedPageIds.has(p.sourcePage.id)) {
            pagesToReturn.push(p.sourcePage);
            addedPageIds.add(p.sourcePage.id);
          }
        });

        return false;
      }
      return true;
    });

    setModels((prev) =>
      prev.map((model) =>
        model.id !== selectedModelId
          ? model
          : {
              ...model,
              agregates: model.agregates.map((agg) =>
                agg.id !== selectedAggregate.id
                  ? agg
                  : { ...agg, node: updatedNodes },
              ),
            },
      ),
    );

    if (pagesToReturn.length) {
      setPages((prev) => [...pagesToReturn, ...prev]);
    }

    setSelectedNodeId(null);
  };

  /* ================== Drop Node from PDF ================== */
  const [, drop] = useDrop({
    accept: "page",
    drop: (item: any) => {
      const page = item.page as PdfPage;
      addNode(page, null, "drop");
    },
  });

  const setNodeRef = (el: HTMLDivElement | null) => drop(el);

  /* ================== Add Node вручную ================== */
  const handleAddNodeByName = (name: string) => {
    const fakePage: PdfPage = {
      id: "manual-" + Date.now(),
      text: name,
      img: "",
    };
    return addNode(fakePage, name, "manual") ?? undefined;
  };

  const updateNodeName = (nodeId: string, newName: string) => {
    if (!selectedModelId || !selectedAggregate) return;

    setModels((prev) =>
      prev.map((model) =>
        model.id !== selectedModelId
          ? model
          : {
              ...model,
              agregates: model.agregates.map((agg) =>
                agg.id !== selectedAggregate.id
                  ? agg
                  : {
                      ...agg,
                      node: agg.node.map((n) =>
                        n.id === nodeId ? { ...n, name: newName } : n,
                      ),
                    },
              ),
            },
      ),
    );
  };

  return {
    handleAddNodeByName,
    updateNodeName,
    removeNode,
    setNodeRef,
    addNode,
  };
};
