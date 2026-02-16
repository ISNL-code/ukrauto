import React, { useRef, useState, useEffect } from "react";
import { ModelHeader } from "../components/PdfManager/ModelHeader/ModelHeader";
import { AggregatesColumn } from "../components/PdfManager/AggregatesColumn/AggregatesColumn";
import { NodesColumn } from "../components/PdfManager/NodesColumn/NodesColumn";
import { PdfPagesPanel } from "../components/PdfManager/PdfPagesPanel/PdfPagesPanel";
import { usePdfPages } from "../components/PdfManager/PdfPagesPanel/usePdfPages";
import { useAggregates } from "../components/PdfManager/AggregatesColumn/useAggregates";
import { useNodes } from "../components/PdfManager/NodesColumn/useNodes";
import { PartsColumn } from "../components/PdfManager/PartsColumn/PartsColumn";
import { useParts } from "../components/PdfManager/PartsColumn/useParts";
import { useModels } from "../components/PdfManager/useModels";

const PdfManager: React.FC = () => {
  /* ================== State ================== */

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const pdfPanelRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useModels();

  /* ================== PDF Pages Hook ================== */
  const { pages, loading, handleFileChange, movePage, removePage, setPages } =
    usePdfPages();

  /* ================== Aggregates Hook ================== */
  const {
    setAggregateRef,
    removeAggregate,
    updateAggregateName,
    addAggregate,
    selectedAggregateId,
    setSelectedAggregateId,
  } = useAggregates({
    selectedModelId,
    setModels,
    selectedModel,
    setPages, // <-- нет selectedAggregateId и setSelectedAggregateId
  });

  const selectedAggregate = selectedModel?.agregates.find(
    (a) => a.id === selectedAggregateId,
  );

  /* ================== Nodes Hook ================== */
  const { handleAddNodeByName, removeNode, updateNodeName, setNodeRef } =
    useNodes({
      selectedModelId,
      selectedAggregate,
      setModels,
      setPages,
      setSelectedNodeId,
      selectedModel, // обязательно передаём текущую модель
      saveModel, // функция сохранения модели сверху
    });

  /* ================== Parts Hook ================== */

  const selectedNode = selectedAggregate?.node.find(
    (n) => n.id === selectedNodeId,
  );

  const {
    addParts,
    updatePart,
    removePart,
    removePartsByPage,
    addImagesToNode,
  } = useParts({
    selectedModel,
    selectedModelId,
    selectedAggregateId,
    selectedNodeId,
    setModels,
    setPages,
    saveModel,
  });

  useEffect(() => {
    setSelectedAggregateId(null);
    setSelectedNodeId(null);
  }, [selectedModelId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ================== Render ================== */
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ModelHeader
        modelName={modelName}
        setModelName={setModelName}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
        models={models}
        saveModel={saveModel}
        deleteModel={deleteModel}
        renameModel={renameModel}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <AggregatesColumn
          selectedModel={selectedModel}
          selectedAggregateId={selectedAggregateId}
          onSelectAggregate={setSelectedAggregateId}
          onUpdateAggregateName={updateAggregateName}
          onRemoveAggregate={removeAggregate}
          dropRef={setAggregateRef}
          addAggregate={addAggregate}
          setModels={setModels} // <- вот сюда
        />
        <NodesColumn
          selectedAggregate={selectedAggregate}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateNodeName={updateNodeName}
          onRemoveNode={removeNode}
          dropRef={setNodeRef}
          addNode={handleAddNodeByName} // <- обёртка для ручного добавления
          setModels={setModels} // <- вот сюда
        />

        <PartsColumn
          selectedNode={selectedNode}
          onAddParts={addParts}
          onUpdatePart={updatePart}
          onRemovePart={removePart}
          removePartsByPage={removePartsByPage} // <-- добавлено
          setPages={setPages}
          addImagesToNode={addImagesToNode} // <-- добавлено
        />

        <PdfPagesPanel
          ref={pdfPanelRef}
          loading={loading}
          pages={pages}
          movePage={movePage}
          removePage={removePage}
          handleFileChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default PdfManager;
