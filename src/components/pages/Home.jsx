import React from "react";
import { Box, Typography, Button, Divider, Paper, Grid } from "@mui/material";
import Sidebar from "../shared/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import useRedirectIfNotLoggedIn from "../../hooks/useRedirectIfNotLoggedIn";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";

// Animação de fade-in
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Redireciona se o usuário não estiver autenticado
    useRedirectIfNotLoggedIn();

    // Se o usuário estiver bloqueado, exibe uma mensagem informando o bloqueio
    if (currentUser?.isActive === false) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #4A148C, #7B1FA2)",
                    color: "#fff",
                    p: 2,
                }}
            >
                <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
                    Acesso Bloqueado
                </Typography>
                <Typography variant="h6" sx={{ textAlign: "center", mb: 4 }}>
                    Seu acesso está bloqueado no momento. Por favor, aguarde a ativação ou entre em contato com o administrador.
                </Typography>
            </Box>
        );
    }

    const role = currentUser?.role;

    return (
        <Box
            sx={{
                display: "flex",
                background: "linear-gradient(135deg, #4A148C, #7B1FA2)",
                minHeight: "100vh",
            }}
        >
            <Sidebar />
            <Box
                sx={{
                    flex: 1,
                    padding: { xs: 2, md: 4 },
                    backgroundColor: "rgba(255,255,255,0.95)",
                    minHeight: "100vh",
                    marginLeft: { md: 30 },
                    animation: `${fadeIn} 0.5s ease-in-out`,
                }}
            >
                <Typography
                    variant="h3"
                    sx={{ fontWeight: "bold", color: "#4A148C", textAlign: "center", mt: 2 }}
                >
                    Olá, {currentUser?.displayName || "Usuário"}!
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ textAlign: "center", mb: 4, color: "#6A1B9A" }}
                >
                    Descubra as incríveis funcionalidades que preparamos para você.
                </Typography>
                <Divider sx={{ my: 4, borderColor: "#B39DDB" }} />

                {role === "admin" && (
                    <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, backgroundColor: "#F3E5F5", animation: `${fadeIn} 0.5s ease-in-out` }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4A148C", mb: 2 }}>
                            Acesso Administrativo Completo
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: "#6A1B9A" }}>
                            Gerencie todos os aspectos do sistema: dashboards interativos, controle de equipamentos,
                            usuários e ordens de serviço. Tenha total controle e supervisão!
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/dashboard")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#4A148C",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#7B1FA2",
                                        },
                                    }}
                                >
                                    Dashboard
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/equipments")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#4A148C",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#7B1FA2",
                                        },
                                    }}
                                >
                                    Equipamentos
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/users")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#4A148C",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#7B1FA2",
                                        },
                                    }}
                                >
                                    Usuários
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/chamados")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#4A148C",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#7B1FA2",
                                        },
                                    }}
                                >
                                    Chamados
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {role === "technician" && (
                    <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, backgroundColor: "#E8EAF6", animation: `${fadeIn} 0.5s ease-in-out` }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#283593", mb: 2 }}>
                            Acesso Técnico
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: "#3F51B5" }}>
                            Gerencie ordens de serviço e acompanhe o desempenho dos equipamentos de forma prática
                            e intuitiva.
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/chamados")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#283593",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#3F51B5",
                                        },
                                    }}
                                >
                                    Ordens de Serviço
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate("/equipments")}
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#283593",
                                        color: "#fff",
                                        transition: "transform 0.2s, background-color 0.2s",
                                        "&:hover": {
                                            transform: "scale(1.05)",
                                            backgroundColor: "#3F51B5",
                                        },
                                    }}
                                >
                                    Equipamentos
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {role !== "admin" && role !== "technician" && (
                    <Paper
                        elevation={4}
                        sx={{
                            p: { xs: 2, md: 4 },
                            borderRadius: 2,
                            backgroundColor: "#FFF3E0",
                            animation: `${fadeIn} 0.5s ease-in-out`,
                        }}
                    >
                        <Typography variant="h5" sx={{ color: "#EF6C00", mb: 3, fontWeight: "bold" }}>
                            Este ambiente procura te oferecer uma ótima experiência de atendimento!<br />
                            Abra novos chamados e acompanhe suas solicitações em tempo real com nosso sistema intuitivo.
                            Tenha acesso rápido às informações, receba atualizações instantâneas e mantenha-se sempre informado
                            sobre o status dos seus pedidos. Tudo isso com uma interface moderna e fácil de usar.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate("/chamados")}
                            sx={{
                                fontWeight: "bold",
                                backgroundColor: "#E65100",
                                color: "#fff",
                                transition: "transform 0.2s, background-color 0.2s",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#EF6C00",
                                },
                            }}
                        >
                            Acessar Chamados
                        </Button>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default Home;