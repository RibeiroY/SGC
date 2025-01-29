import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const UserBlocked = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#2B1432",
                color: "#fff",
                textAlign: "center",
                padding: 3,
            }}
        >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                Você deve ser ativado por um ADM antes de acessar nosso serviço.
            </Typography>
            <Typography variant="body1">
                Entre em contato com um administrador para ativar sua conta.
            </Typography>
            <Button
                variant="contained"
                sx={{
                    mt: 3,
                    backgroundColor: "#FFA500",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#FF8C00" },
                }}
                onClick={handleLogout}
            >
                Sair
            </Button>
        </Box>
    );
};

export default UserBlocked;
