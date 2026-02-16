import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDrop } from "react-dnd";
import { Model, Aggregate, PdfPage, Node, Part } from "../../../types/catalog";
import { saveModelToDB } from "../useModels";

interface UseAggregatesProps {
  selectedModelId: string | null;
  selectedModel: Model | undefined;
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;
  saveModel?: (model: Model) => Promise<void>; // функция сохранения передается сверху
}

export const useAggregates = ({
  selectedModelId,
  selectedModel,
  setModels,
  setPages,
  saveModel,
}: UseAggregatesProps) => {
  const [selectedAggregateId, setSelectedAggregateId] = useState<string | null>(
    null,
  );
  const aggregateRef = useRef<HTMLDivElement>(null);

  /* ================== Сохраняем модель в DB при изменении selectedModel ================== */
  useEffect(() => {
    if (selectedModel) {
      saveModelToDB(selectedModel);
    }
  }, [selectedModel, saveModel]);

  /* ================== Add Aggregate ================== */
  const addAggregate = (
    name?: string,
    fromPdf = false,
    img?: string,
  ): string | undefined => {
    if (!selectedModelId || !selectedModel) return;

    const aggregate: Aggregate = {
      id: uuidv4(),
      name: name || "Новый агрегат",
      node: [],
      fromPdf,
      img: img ? [img] : undefined,
    };

    setModels((prev) =>
      prev.map((m) =>
        m.id === selectedModelId
          ? { ...m, agregates: [...m.agregates, aggregate] }
          : m,
      ),
    );

    setSelectedAggregateId(aggregate.id);
    return aggregate.id;
  };

  /* ================== Remove Aggregate ================== */
  const removeAggregate = async (aggregateId: string) => {
    if (!selectedModel || !selectedModelId) return;

    const pagesToReturn: PdfPage[] = [];
    const addedPageIds = new Set<string>();

    const updatedAggregates = selectedModel.agregates.filter((agg) => {
      if (agg.id === aggregateId) {
        // возвращаем дропнутые изображения агрегата
        if (agg.fromPdf && agg.img?.length) {
          agg.img.forEach((image) => {
            if (!addedPageIds.has(image)) {
              pagesToReturn.push({ id: uuidv4(), text: agg.name, img: image });
              addedPageIds.add(image);
            }
          });
        }

        // возвращаем дропнутые ноды
        agg.node.forEach((n: Node) => {
          if (n.fromPdf && n.img?.length) {
            n.img.forEach((image) => {
              if (!addedPageIds.has(image)) {
                pagesToReturn.push({ id: uuidv4(), text: n.name, img: image });
                addedPageIds.add(image);
              }
            });
          }

          // возвращаем sourcePage деталей
          n.parts?.forEach((p: Part & { sourcePage?: PdfPage }) => {
            if (
              p.sourcePage &&
              !p.sourcePage.id.startsWith("manual-") &&
              !addedPageIds.has(p.sourcePage.id)
            ) {
              pagesToReturn.push(p.sourcePage);
              addedPageIds.add(p.sourcePage.id);
            }
          });
        });

        return false; // удаляем агрегат
      }
      return true;
    });

    setModels((prev) => {
      const newModels = prev.map((m) =>
        m.id === selectedModelId ? { ...m, agregates: updatedAggregates } : m,
      );

      if (saveModel) {
        const modelToSave = newModels.find((m) => m.id === selectedModelId);
        if (modelToSave) saveModel(modelToSave);
      }

      return newModels;
    });

    if (pagesToReturn.length) setPages((prev) => [...pagesToReturn, ...prev]);

    if (selectedAggregateId === aggregateId) setSelectedAggregateId(null);
  };

  /* ================== Update Aggregate Name ================== */
  const updateAggregateName = async (aggregateId: string, newName: string) => {
    if (!selectedModel || !selectedModelId) return;

    setModels((prev) => {
      const newModels = prev.map((m) =>
        m.id === selectedModelId
          ? {
              ...m,
              agregates: m.agregates.map((a) =>
                a.id === aggregateId ? { ...a, name: newName } : a,
              ),
            }
          : m,
      );

      if (saveModel) {
        const modelToSave = newModels.find((m) => m.id === selectedModelId);
        if (modelToSave) saveModel(modelToSave);
      }

      return newModels;
    });
  };

  /* ================== Drop Aggregate ================== */
  const [, dropAggregate] = useDrop({
    accept: "page",
    drop: (item: any) => {
      if (!selectedModel) return;
      const page = item.page as PdfPage;

      addAggregate(page.text.slice(0, 80) || "Новый агрегат", true, page.img);

      setPages((prev) => prev.filter((p) => p.id !== page.id));
    },
  });

  const setAggregateRef = (node: HTMLDivElement | null) => {
    aggregateRef.current = node;
    dropAggregate(node);
  };

  return {
    aggregateRef,
    setAggregateRef,
    addAggregate,
    removeAggregate,
    updateAggregateName,
    selectedAggregateId,
    setSelectedAggregateId,
  };
};
