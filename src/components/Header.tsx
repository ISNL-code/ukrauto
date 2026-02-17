// src/components/Header.tsx
/* eslint-disable */
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Box,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

export interface SearchOption {
  label: string;
  modelId: string;
  nodeId: string;
  partId: string;
}

interface HeaderProps {
  allParts: SearchOption[];
  highlightPart: string | null;
  setHighlightPart: (partId: string) => void;
  isLoggedIn: boolean;
  onLogin: (password: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  allParts,
  highlightPart,
  setHighlightPart,
  isLoggedIn,
  onLogin,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [openLogin, setOpenLogin] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleLogin = () => {
    onLogin(password);
    setPassword("");
    setOpenLogin(false);
  };

  return (
    <>
      <AppBar position="static" color="inherit" elevation={3}>
        <Toolbar
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 1,
            py: 1.5,
            px: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              gap: 2,
            }}
          >
            {/* Заголовок */}
            <Typography
              variant="h5"
              sx={{ cursor: "pointer", fontWeight: 600 }}
              onClick={() => navigate("/catalog")}
            >
              Каталог Укравто
            </Typography>

            {/* Поиск */}
            <Autocomplete
              freeSolo
              options={allParts}
              value={null} // выбранное значение не храним
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              sx={{ minWidth: 300, maxWidth: 420 }}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              filterOptions={(options, state) =>
                options.filter((opt) =>
                  opt.label
                    .toLowerCase()
                    .includes(state.inputValue.toLowerCase()),
                )
              }
              onChange={(event, value) => {
                if (!value || typeof value === "string") return;

                setHighlightPart(value.partId);
                navigate(`/catalog/${value.modelId}/node/${value.nodeId}`);

                // 🔥 очищаем инпут после перехода
                setInputValue("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Поиск по Part Number"
                  sx={{ backgroundColor: "white", borderRadius: 1 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* Кнопки входа / редактирования */}
            {isLoggedIn ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate("/pdf-manager")}
                >
                  Редактор
                </Button>
                <Button variant="outlined" color="error" onClick={onLogout}>
                  Выйти
                </Button>
              </Box>
            ) : (
              <Button variant="contained" onClick={() => setOpenLogin(true)}>
                Войти
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Модалка логина */}
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
        <DialogTitle>Вход администратора</DialogTitle>
        <DialogContent>
          <TextField
            size="small"
            autoFocus
            fullWidth
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogin(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleLogin}>
            Войти
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
