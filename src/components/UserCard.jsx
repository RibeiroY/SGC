import React from "react";
import { Card, Box, Avatar, Typography, Select, MenuItem } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CustomSwitch from "./shared/CustomSwitch"; // Importando CustomSwitch
import { format } from "date-fns";

// Função auxiliar para formatar o lastLogin de forma segura
const getFormattedLastLogin = (lastLogin) => {
  if (!lastLogin) return "Sem registro";
  
  let date;
  if (lastLogin instanceof Date) {
    date = lastLogin;
  } else if (typeof lastLogin.toDate === "function") {
    date = lastLogin.toDate();
  } else {
    date = new Date(lastLogin);
  }
  
  if (isNaN(date.getTime())) {
    return "Sem registro";
  }
  
  return format(date, "dd/MM/yyyy HH:mm");
};

const UserCard = ({ user, updateUserRole, toggleUserActive, updateUserSetor, currentUser }) => {
  const formattedLastLogin = getFormattedLastLogin(user.lastLogin);

  return (
    <Card
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: "#FAFAFA",
        borderLeft: `6px solid ${user.isActive ? "#4CAF50" : "#F44336"}`,
        "&:hover": {
          transform: "scale(1.02)",
          transition: "0.2s ease-in-out",
        },
      }}
    >
      {/* Avatar com inicial do nome */}
      <Avatar sx={{ bgcolor: "#6A1B9A", width: 50, height: 50 }}>
        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <PersonIcon />}
      </Avatar>

      {/* Conteúdo do card */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4A148C" }}>
          {user.displayName || "N/A"}
        </Typography>

        {/* Username */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountCircleIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
          <Typography variant="body2" color="textSecondary">
            {user.username || "N/A"}
          </Typography>
        </Box>

        {/* Email */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
          <Typography variant="body2" color="textSecondary">
            {user.email || "N/A"}
          </Typography>
        </Box>

        {/* Último Login */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
          <Typography variant="body2" color="textSecondary">
            {formattedLastLogin}
          </Typography>
        </Box>

        {/* Role (Função) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <WorkIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
          <Select
            value={user.role}
            onChange={(e) => updateUserRole(user.id, e.target.value)}
            disabled={user.email === currentUser.email}
            fullWidth
            size="small"
            sx={{ backgroundColor: "#fff", borderRadius: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="technician">Technician</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </Box>

        {/* Setor */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <WorkIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
          <Select
            value={user.setor || ''}
            onChange={(e) => updateUserSetor(user.id, e.target.value)}
            fullWidth
            size="small"
            sx={{ backgroundColor: "#fff", borderRadius: 2 }}
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
        </Box>

        {/* Switch de Ativo */}
        <CustomSwitch
          checked={user.isActive ?? true}
          onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
          disabled={user.email === currentUser.email || user.role === "admin"}
        />
      </Box>
    </Card>
  );
};

export default UserCard;
