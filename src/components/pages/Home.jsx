import React from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "../shared/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import useRedirectIfNotLoggedIn from "../../hooks/useRedirectIfNotLoggedIn";
import UserBlocked from "../../components/UserBlocked"; // Novo componente

const Home = () => {
    const { currentUser } = useAuth();

    // Hook que redireciona se o usuário não estiver autenticado
    useRedirectIfNotLoggedIn();

    // Se o usuário estiver bloqueado, exibe a tela de "aguarde ativação"
    if (currentUser?.isActive === false) {
        return <UserBlocked />;
    }

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
                sx={{
                    flex: 1,
                    padding: 3,
                    backgroundColor: "rgba(104, 100, 100, 0.5)",
                    color: "black",
                    minHeight: "100vh",
                }}
            >
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Olá, {currentUser?.displayName || "Usuário"}!
                </Typography>
            </Box>
        </Box>
    );
};

export default Home;
