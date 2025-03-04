import React from 'react';
import { Box, Card, Typography, Button, Avatar, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment'; // Ícone para chamados
import { useNavigate } from 'react-router-dom';

const ChamadosCard = ({ chamado }) => {
    const navigate = useNavigate();

    // Verifica se o chamado existe antes de acessar suas propriedades
    if (!chamado) {
        return null;  // Não renderiza nada se o chamado não existir
    }

    // Função para navegar para os detalhes do chamado
    const handleVerDetalhes = (chamadoId) => {
        navigate(`/chamados/${chamadoId}`);
    };

    // Define a cor da borda com base no status
    const getBorderColor = (status) => {
        switch (status) {
            case 'Aberto':
                return "#4CAF50"; // Verde
            case 'Em Atendimento':
                return "#FFA726"; // Laranja
            case 'Fechado':
                return "#F44336"; // Vermelho
            default:
                return "#9E9E9E"; // Cinza (fallback)
        }
    };

    // Define o texto e a cor do Chip com base no status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Aberto':
                return { label: "Aberto", color: "success" }; // Verde
            case 'Em Atendimento':
                return { label: "Em Atendimento", color: "warning" }; // Laranja
            case 'Fechado':
                return { label: "Fechado", color: "error" }; // Vermelho
            default:
                return { label: "Desconhecido", color: "default" }; // Fallback
        }
    };

    const statusInfo = getStatusInfo(chamado.status);

    return (
        <Card
            sx={{
                mb: 2,
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 3,
                backgroundColor: "#FFFFFF",
                borderLeft: `6px solid ${getBorderColor(chamado.status)}`,
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 6,
                },
            }}
        >
            {/* Avatar com o ícone do chamado */}
            <Avatar
                sx={{
                    bgcolor: "#3F51B5",
                    width: 60,
                    height: 60,
                    boxShadow: 2,
                }}
            >
                <AssignmentIcon fontSize="medium" />
            </Avatar>

            {/* Conteúdo do card */}
            <Box sx={{ flexGrow: 1 }}>
                {/* Título do chamado */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        color: "#303F9F",
                        mb: 1,
                    }}
                >
                    {chamado.titulo || "Chamado sem título"}
                </Typography>

                {/* Código do equipamento */}
                <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                >
                    Equipamento: {chamado.equipamento || "N/A"}
                </Typography>

                {/* Status e prioridade */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                    <Chip
                        label={`Prioridade: ${chamado.prioridade || "N/A"}`}
                        color="warning"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                </Box>

                {/* Botão para ver detalhes */}
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleVerDetalhes(chamado.id)}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: "bold",
                        boxShadow: 2,
                        "&:hover": {
                            boxShadow: 4,
                            backgroundColor: "#1565C0",
                        },
                    }}
                >
                    Ver Detalhes
                </Button>
            </Box>
        </Card>
    );
};

export default ChamadosCard;