import React, { useState } from "react";
import { Box, Typography, TextField, CircularProgress, useMediaQuery } from "@mui/material";
import Sidebar from "../shared/Sidebar";
import UserTable from "../../components/UserTable"; // 📌 Tabela para Desktop
import UserCard from "../../components/UserCard"; // 📌 Cards para Mobile
import { useUsers } from "../../hooks/useUsers"; // 📌 Hook personalizado para buscar e gerenciar usuários
import { useAuth } from "../../contexts/AuthContext"; // 📌 Pega o usuário autenticado

const Users = () => {
    const { users, loading, toggleUserActive, updateUserRole, updateUserSetor } = useUsers();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const isMobile = useMediaQuery("(max-width:768px)");

    // 🔍 Filtro de usuários baseado na pesquisa
    const filteredUsers = users.filter((user) =>
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    // ⏳ Enquanto carrega, exibe tela de loading
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
            <Box sx={{ flex: 1, padding: 3, backgroundColor: "#f4f4f4", minHeight: "100vh", marginLeft: { md:30} }}>
                <Typography variant="h4" gutterBottom>Gerenciar Usuários</Typography>

                <TextField
                    label="Buscar por username ou e-mail"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {isMobile ? (
                    // 📱 Exibição de usuários em cards (mobile)
                    <Box>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
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
                    // 💻 Exibição de usuários em tabela (desktop)
                    <UserTable users={filteredUsers} updateUserRole={updateUserRole} toggleUserActive={toggleUserActive} currentUser={currentUser} updateUserSetor={updateUserSetor}  />
                )}
            </Box>
        </Box>
    );
};

export default Users;
