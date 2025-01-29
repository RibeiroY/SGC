import React from "react";
import { Card, Box, Avatar, Typography, Select, MenuItem, Switch } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkIcon from "@mui/icons-material/Work";

const UserCard = ({ user, updateUserRole, toggleUserActive, currentUser }) => {
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
            </Box>

            {/* Status Ativo/Inativo */}
            <Box>
                <Switch
                    checked={user.isActive ?? true}
                    onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
                    disabled={user.email === currentUser.email}
                />
            </Box>
        </Card>
    );
};

export default UserCard;
