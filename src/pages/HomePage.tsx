import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Небольшая задержка для отображения loader (можно убрать если не нужна)
    const timer = setTimeout(() => {
      navigate("/catalog", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default HomePage;
