import React, { useRef, useState } from "react";
import { Node, Part, PdfPage } from "../../../types/catalog";
import { Box, Paper, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import { useFormatParts } from "./useFormatParts";

interface PartsTableColumnProps {
  selectedNode?: Node;
  onAddParts: (parts: Omit<Part, "id">[], sourcePage?: PdfPage) => void;
  onRemovePartsByPage: (pageId: string) => void;
  onUpdatePart: (partId: string, patch: Partial<Part>) => void;
  onRemovePart: (partId: string) => void;
  setPages: React.Dispatch<React.SetStateAction<PdfPage[]>>;
}

const AutoTextarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ value, onChange, style, ...props }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  React.useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        resize();
        onChange?.(e);
      }}
      style={{ ...textareaStyle, ...style }}
      rows={1}
      {...props}
    />
  );
};

export const PartsTableColumn: React.FC<PartsTableColumnProps> = ({
  selectedNode,
  onAddParts,
  onRemovePartsByPage,
  onUpdatePart,
  onRemovePart,
  setPages,
}) => {
  const parts = selectedNode?.parts ?? [];
  const partsRef = useRef<HTMLDivElement>(null);
  const { parsePartsFromText } = useFormatParts();
  const [newAltValues, setNewAltValues] = useState<Record<string, string>>({});

  // Drop PDF страницы
  const [, dropParts] = useDrop({
    accept: "page",
    drop: (item: { page: PdfPage }) => {
      if (!selectedNode) return;
      const page = item.page;
      if (!page.text?.trim()) return;

      const newParts = parsePartsFromText(page.text).map((p) => ({
        ...p,
        sourcePage: page,
      }));

      onAddParts(newParts, page);
    },
  });

  // Группировка деталей по страницам
  const groupedParts: Record<string, Part[]> = {};
  parts.forEach((part) => {
    const pageId = part.sourcePage?.id || `manual-${part.id}`;
    if (!groupedParts[pageId]) groupedParts[pageId] = [];
    groupedParts[pageId].push(part);
  });

  selectedNode?._pages?.forEach((page) => {
    if (!groupedParts[page.id]) groupedParts[page.id] = [];
  });

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.currentTarget.style.background = "#f3f4f6");

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.currentTarget.style.background = "transparent");

  const handleAddAltNumber = (part: Part) => {
    const val = newAltValues[part.id]?.trim();
    if (!val) return;

    onUpdatePart(part.id, {
      alternatePartNumbers: [...(part.alternatePartNumbers ?? []), val],
    });

    setNewAltValues((prev) => ({ ...prev, [part.id]: "" }));
  };

  const handleRemoveAltNumber = (part: Part, idx: number) => {
    onUpdatePart(part.id, {
      alternatePartNumbers: part.alternatePartNumbers?.filter(
        (_, i) => i !== idx,
      ),
    });
  };

  const handleUpdateAltNumber = (part: Part, idx: number, value: string) => {
    const updated = [...(part.alternatePartNumbers ?? [])];
    updated[idx] = value;
    onUpdatePart(part.id, { alternatePartNumbers: updated });
  };

  const handleAddNewPart = (pageId: string) => {
    if (!selectedNode) return;
    const existingPage = selectedNode._pages?.find((p) => p.id === pageId);

    const newPart: Omit<Part, "id"> = {
      schemeNumber: "",
      partNumber: "",
      alternatePartNumbers: [],
      descriptionRu: "",
      descriptionUk: "",
      quantity: 1,
      sourcePage: existingPage,
    };

    onAddParts([newPart], existingPage);
  };

  const handleAddNewPage = () => {
    if (!selectedNode) return;

    const newPage: PdfPage = {
      id: `manual-${Date.now()}`,
      text: "",
      img: "",
    };

    // Добавляем новый пустой лист в модель
    onAddParts([], newPage);
  };

  const handleDeletePage = (page?: PdfPage) => {
    if (!page) return;

    onRemovePartsByPage(page.id);
  };

  return (
    <Box
      p={2}
      ref={(node: HTMLDivElement | null) => {
        partsRef.current = node;
        if (node) dropParts(node as HTMLElement); // явно кастуем
      }}
      sx={{ flex: 1, overflowY: "auto" }}
    >
      {selectedNode && (
        <Box mb={1} display="flex" justifyContent="flex-end">
          <button
            style={{
              padding: "4px 8px",
              cursor: "pointer",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 12,
            }}
            onClick={handleAddNewPage}
          >
            + Новый лист
          </button>
        </Box>
      )}

      {!selectedNode ? (
        <Typography sx={emptyText}>
          Выберите узел, чтобы увидеть запчасти
        </Typography>
      ) : Object.keys(groupedParts).length === 0 ? (
        <Typography sx={emptyText}>
          В этом узле пока нет запчастей.
          <br />
          Перетащите PDF-страницу или добавьте новый лист.
        </Typography>
      ) : (
        Object.entries(groupedParts).map(([pageId, pageParts], idx) => {
          const page = selectedNode?._pages?.find((p) => p.id === pageId);

          return (
            <div key={pageId} style={{ marginBottom: 16 }}>
              <Box sx={pageHeader}>
                <Typography sx={{ fontSize: 12, fontStyle: "italic" }}>
                  {page ? `Лист: ${idx + 1}` : "Ручное добавление"}
                </Typography>

                <Typography
                  sx={deletePageBtn}
                  onClick={() => handleDeletePage(page)}
                >
                  Удалить лист
                </Typography>
              </Box>

              <Paper elevation={0} sx={tableWrapper}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: 40 }}>№</th>
                      <th style={{ ...th, width: 120 }}>Parts №</th>
                      <th style={{ ...th, width: 135 }}>Alternate №</th>
                      <th style={{ ...th, width: 140 }}>Description (RU)</th>
                      <th style={{ ...th, width: 140 }}>Description (UK)</th>
                      <th style={{ ...th, width: 55 }}>Qty</th>
                      <th style={{ ...th, width: 10 }} />
                    </tr>
                  </thead>

                  <tbody>
                    {pageParts.map((p) => (
                      <tr key={p.id}>
                        <td style={tdCenter}>
                          <input
                            value={p.schemeNumber ?? ""}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) =>
                              onUpdatePart(p.id, {
                                schemeNumber: e.target.value,
                              })
                            }
                            style={inputCenter}
                            placeholder="..."
                          />
                        </td>

                        <td style={tdMono}>
                          <input
                            value={p.partNumber ?? ""}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) =>
                              onUpdatePart(p.id, { partNumber: e.target.value })
                            }
                            style={inputMono}
                            placeholder="..."
                          />
                        </td>

                        <td style={td}>
                          {(p.alternatePartNumbers ?? []).map((num, idx) => (
                            <div key={idx} style={altRow}>
                              <input
                                value={num}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onChange={(e) =>
                                  handleUpdateAltNumber(p, idx, e.target.value)
                                }
                                style={inputMono}
                                placeholder="..."
                              />
                              <button
                                onClick={() => handleRemoveAltNumber(p, idx)}
                                style={deleteBtn}
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <div style={altRow}>
                            <input
                              value={newAltValues[p.id] ?? ""}
                              onChange={(e) =>
                                setNewAltValues((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault(); // предотвращаем стандартное поведение
                                  handleAddAltNumber(p); // вызываем функцию добавления
                                }
                              }}
                              style={input}
                              placeholder="Введите №..."
                            />
                            <button
                              onClick={() => handleAddAltNumber(p)}
                              style={addBtn}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td style={td}>
                          <AutoTextarea
                            value={p.descriptionRu ?? ""}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) =>
                              onUpdatePart(p.id, {
                                descriptionRu: e.target.value,
                              })
                            }
                            placeholder="..."
                          />
                        </td>

                        <td style={td}>
                          <AutoTextarea
                            value={p.descriptionUk ?? ""}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) =>
                              onUpdatePart(p.id, {
                                descriptionUk: e.target.value,
                              })
                            }
                            placeholder="..."
                          />
                        </td>

                        <td style={tdCenter}>
                          <input
                            type="number"
                            value={p.quantity ?? 0}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChange={(e) =>
                              onUpdatePart(p.id, {
                                quantity: Number(e.target.value),
                              })
                            }
                            style={inputCenter}
                            placeholder="..."
                          />
                        </td>

                        <td style={tdCenter}>
                          <button
                            onClick={() => onRemovePart(p.id)}
                            style={deleteBtn}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={() => handleAddNewPart(pageId)}
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    cursor: "pointer",
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    marginTop: 4,
                  }}
                >
                  + Добавить деталь
                </button>
              </Paper>
            </div>
          );
        })
      )}
    </Box>
  );
};

/* ================= STYЛES ================= */

const emptyText = { fontSize: 12, color: "#666", fontStyle: "italic" };
const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  padding: "4px 6px",
  borderTop: "1px dashed #ccc",
};
const deletePageBtn = { fontSize: 12, cursor: "pointer", color: "red" };
const tableWrapper = { border: "1px solid #ececec", borderRadius: 4 };
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: 13,
};
const th = {
  padding: 6,
  borderBottom: "1px solid #ddd",
  background: "#fafafa",
};
const td = {
  padding: 6,
  borderBottom: "1px solid #eee",
  verticalAlign: "top" as const,
};
const tdCenter = { ...td, textAlign: "center" as const };
const tdMono = { ...td, fontFamily: "monospace" };
const baseInput = {
  width: "100%",
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: 13,
};
const input = { ...baseInput };
const inputMono = { ...baseInput, fontFamily: "monospace" };
const inputCenter = { ...baseInput, textAlign: "center" as const };
const textareaStyle = {
  ...baseInput,
  resize: "none" as const,
  overflow: "hidden",
  lineHeight: 1.4,
};
const altRow = { display: "flex", gap: 4, marginBottom: 4 };
const addBtn = {
  border: "none",
  background: "none",
  color: "#007bff",
  cursor: "pointer",
  fontSize: 20,
};
const deleteBtn = {
  border: "none",
  background: "none",
  color: "red",
  cursor: "pointer",
};
