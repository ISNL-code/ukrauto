import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { openDB } from "idb";
import { Model } from "../../types/catalog";

/* ================== IndexedDB ================== */
const DB_NAME = "catalogDB";
const STORE_NAME = "models";
const DB_VERSION = 1;

// Создаем/открываем базу
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

// Получить все модели
async function getModelsFromDB(): Promise<Model[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

// Сохранить модели (по одной)
export async function saveModelToDB(model: Model) {
  const db = await getDB();
  await db.put(STORE_NAME, model);
}

// Удалить модель
async function deleteModelFromDB(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

// Переименовать модель
async function renameModelInDB(id: string, name: string) {
  const db = await getDB();
  const model = await db.get(STORE_NAME, id);
  if (model) {
    model.name = name;
    await db.put(STORE_NAME, model);
  }
}

/* ================== Hook ================== */
export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [modelName, setModelName] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  /* ================== Load on mount ================== */
  useEffect(() => {
    getModelsFromDB().then(setModels);
  }, []);

  /* ================== Create ================== */
  const saveModel = async () => {
    if (!modelName.trim()) return;

    const newModel: Model = {
      id: uuidv4(),
      name: modelName,
      agregates: [],
    };

    await saveModelToDB(newModel);
    setModels((prev) => [...prev, newModel]);
    setSelectedModelId(newModel.id);
    setModelName("");
  };

  /* ================== Update ================== */
  const renameModel = async (id: string, name: string) => {
    await renameModelInDB(id, name);
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  /* ================== Delete ================== */
  const deleteModel = async (id: string) => {
    await deleteModelFromDB(id);
    setModels((prev) => prev.filter((m) => m.id !== id));

    if (selectedModelId === id) {
      setSelectedModelId(null);
      setModelName("");
    }
  };

  return {
    models,
    setModels,
    selectedModel,
    selectedModelId,
    setSelectedModelId,
    modelName,
    setModelName,
    saveModel,
    renameModel,
    deleteModel,
  };
};
