import { openDB } from "idb";
import { Model } from "../types/catalog";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "catalogDB";
const STORE_NAME = "models";
const DB_VERSION = 1;

// Получаем или создаем базу
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

/* ================== CRUD ================== */

// Получить все модели
export async function getModels(): Promise<Model[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

// Сохранить или обновить одну модель
export async function saveModel(model: Model) {
  const db = await getDB();
  await db.put(STORE_NAME, model);
}

// Создать новую модель
export async function createModel(name: string): Promise<Model> {
  const model: Model = {
    id: uuidv4(),
    name,
    agregates: [],
  };
  await saveModel(model);
  return model;
}

// Добавить агрегаты к существующей модели
export async function addAggregatesToModel(
  modelId: string,
  agregates: Model["agregates"],
) {
  const db = await getDB();
  const model = await db.get(STORE_NAME, modelId);
  if (!model) return;
  model.agregates.push(...agregates);
  await db.put(STORE_NAME, model);
}

// Удалить модель
export async function deleteModel(modelId: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, modelId);
}

// Переименовать модель
export async function renameModel(modelId: string, name: string) {
  const db = await getDB();
  const model = await db.get(STORE_NAME, modelId);
  if (!model) return;
  model.name = name;
  await db.put(STORE_NAME, model);
}
