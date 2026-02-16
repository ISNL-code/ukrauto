// src/services/catalogService.ts
import catalog from "../data/catalog.mock.json";
import { Model, Node } from "../types/catalog";

// Приводим JSON к нашим типам
const catalogData: Model[] = catalog as unknown as Model[];

/**
 * Получить все модели
 */
export function getModels(): Model[] {
  return catalogData;
}

/**
 * Получить модель по id
 */
export function getModelById(modelId: string): Model | undefined {
  return catalogData.find((m) => m.id === modelId);
}

/**
 * Получить узел (node) по id модели и id узла
 */
export function getNodeById(
  modelId: string,
  nodeId: string,
): { node: Node; aggregateName: string } | null {
  const model = getModelById(modelId);
  if (!model) return null;

  for (const ag of model.agregates) {
    const node = ag.node.find((n) => n.id === nodeId);
    if (node) return { node, aggregateName: ag.name };
  }

  return null;
}
