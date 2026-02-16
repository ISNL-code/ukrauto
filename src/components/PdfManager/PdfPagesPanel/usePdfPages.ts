// src/hooks/usePdfPages.ts
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { v4 as uuidv4 } from "uuid";
import { PdfPage } from "../../../types/catalog";

/* PDF Worker */
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const usePdfPages = () => {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [loading, setLoading] = useState(false);

  /* Загрузка PDF */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;

    const loadedPages: PdfPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport })
        .promise;

      const text = (await page.getTextContent()).items
        .map((i: any) => {
          return i.str;
        })
        .join(" ");

      loadedPages.push({ id: uuidv4(), img: canvas.toDataURL(), text });
    }

    setPages(loadedPages);
    setLoading(false);
  };

  /* Перемещение страниц */
  const movePage = (from: number, to: number) => {
    setPages((prev) => {
      const arr = [...prev];
      arr.splice(to, 0, arr.splice(from, 1)[0]);
      return arr;
    });
  };

  /* Удаление страницы */
  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    pages,
    loading,
    handleFileChange,
    movePage,
    removePage,
    setPages,
  };
};
