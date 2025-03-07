import React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Box,
  Button,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomSwitch from "./shared/CustomSwitch"; // Importando o CustomSwitch

const UserTable = ({ users, updateUserRole, toggleUserActive, updateUserSetor, currentUser }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  // Função para truncar texto
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        overflow: "hidden",
        marginTop: 3,
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#6A1B9A" }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nome</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Data de Criação</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Último Login</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Função</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Setor</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ativo</TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              sx={{
                backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#B39DDB",
                },
              }}
            >
              <TableCell>
                <Tooltip title={user.displayName || "N/A"} placement="top">
                  <Box>{truncateText(user.displayName || "N/A", isMobile ? 10 : 20)}</Box>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={user.username || "N/A"} placement="top">
                  <Box>{truncateText(user.username || "N/A", isMobile ? 10 : 20)}</Box>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={user.email || "N/A"} placement="top">
                  <Box>{truncateText(user.email || "N/A", isMobile ? 15 : 25)}</Box>
                </Tooltip>
              </TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  disabled={user.role === "admin"}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6A1B9A",
                    },
                  }}
                >
                  <MenuItem value="user">Usuário</MenuItem>
                  <MenuItem value="technician">Técnico</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={user.setor || ""}
                  onChange={(e) => updateUserSetor(user.id, e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6A1B9A",
                    },
                  }}
                >
                  <MenuItem value="TI">TI</MenuItem>
                  <MenuItem value="Administração">Administração</MenuItem>
                  <MenuItem value="Jurídico">Jurídico</MenuItem>
                  <MenuItem value="Financeiro">Financeiro</MenuItem>
                  <MenuItem value="RH">RH</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Vendas">Vendas</MenuItem>
                  <MenuItem value="Recepção">Recepção</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <CustomSwitch
                  checked={user.isActive ?? true}
                  onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
                  disabled={user.email === currentUser?.email || user.role === "admin"}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/users/${user.id}`)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    backgroundColor: "#6A148C",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#4A148C",
                    },
                  }}
                >
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
