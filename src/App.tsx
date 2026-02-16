import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import HomePage from "./pages/HomePage";
import CatalogModels from "./pages/CatalogModels";
import ModelPage from "./pages/ModelPage";
import NodePage from "./pages/NodePage";
import PdfManager from "./pages/PdfManager";
import { CatalogLayout } from "./layouts/CatalogLayout";

// Простая 404-страница
const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: "center", marginTop: 100 }}>
    <h1>404</h1>
    <p>Страница не найдена</p>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const handleLogin = (password: string) => {
    if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } else {
      alert("Неверный пароль");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* PDF Manager доступен только если залогинен */}
          {isLoggedIn && <Route path="/pdf-manager" element={<PdfManager />} />}

          {/* Каталог */}
          <Route
            path="/catalog"
            element={
              <CatalogLayout
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            }
          >
            <Route index element={<CatalogModels />} />
            <Route path=":modelId" element={<ModelPage />} />
            <Route path=":modelId/node/:nodeId" element={<NodePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DndProvider>
    </BrowserRouter>
  );
}

export default App;
