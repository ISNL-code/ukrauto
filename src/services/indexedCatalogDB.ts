// src/services/indexedCatalogDB.ts
import { openDB } from "idb";
import { Model } from "../types/catalog";

const DB_NAME = "CatalogDB";
const STORE_NAME = "models";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function getModels(): Promise<Model[]> {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) as Model[];
}

export async function saveModels(models: Model[]) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).clear();
  for (const model of models) {
    await tx.objectStore(STORE_NAME).put(model);
  }
  await tx.done;
}

export async function createModel(model: Model) {
  const db = await getDB();
  await db.put(STORE_NAME, model);
}
