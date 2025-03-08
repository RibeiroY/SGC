import React, { useState } from "react";
import { Box, Typography, TextField, CircularProgress, useMediaQuery } from "@mui/material";
import Sidebar from "../components/shared/Sidebar";
import UserTable from "../components/UserTable"; // Componente que exibe os usuários em tabela
import UserCard from "../components/UserCard"; // Componente para exibir usuários em cards (mobile)
import { useUsers } from "../hooks/useUsers"; // Hook que agora busca também o lastLogin
import { useAuth } from "../contexts/AuthContext";

const Users = () => {
  const { users, loading, toggleUserActive, updateUserRole, updateUserSetor } = useUsers();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const isMobile = useMediaQuery("(max-width:768px)");

  // Filtra os usuários com base em nome, username, e-mail ou mesmo lastLogin (se desejar)
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#2B1432", color: "#fff" }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 3, backgroundColor: "#f4f4f4", minHeight: "100vh", ml: { md:30} }}>
        <Typography variant="h4" gutterBottom>Gerenciar Usuários</Typography>

        <TextField
          label="Buscar por nome, username ou e-mail"
          variant="outlined"
          fullWidth
          margin="normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isMobile ? (
          <Box>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user} // Aqui você pode acessar user.lastLogin e exibi-lo
                  updateUserRole={updateUserRole}
                  updateUserSetor={updateUserSetor}
                  toggleUserActive={toggleUserActive}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <Typography align="center">Nenhum usuário encontrado.</Typography>
            )}
          </Box>
        ) : (
          <UserTable
            users={filteredUsers} // No UserTable você pode exibir uma coluna "Último Login"
            updateUserRole={updateUserRole}
            toggleUserActive={toggleUserActive}
            currentUser={currentUser}
            updateUserSetor={updateUserSetor}
          />
        )}
      </Box>
    </Box>
  );
};

export default Users;
