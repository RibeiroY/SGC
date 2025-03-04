import React from 'react';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
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
            case 'aberto':
                return "#4CAF50"; // Verde
            case 'em atendimento':
                return "#FFA726"; // Laranja
            case 'fechado':
                return "#F44336"; // Vermelho
            default:
                return "#9E9E9E"; // Cinza (fallback)
        }
    };

    // Define o texto e a cor do Chip com base no status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'aberto':
                return { label: "Aberto", color: "success" }; // Verde
            case 'em atendimento':
                return { label: "Em Atendimento", color: "warning" }; // Laranja
            case 'fechado':
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
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#FAFAFA",
                borderLeft: `6px solid ${getBorderColor(chamado.status)}`,
                "&:hover": {
                    transform: "scale(1.02)",
                    transition: "0.2s ease-in-out",
                },
            }}
        >
            {/* Avatar com o ícone do chamado */}
            <Avatar sx={{ bgcolor: "#3F51B5", width: 50, height: 50 }}>
                <AssignmentIcon />
            </Avatar>

            {/* Conteúdo do card */}
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#303F9F" }}>
                    {chamado.titulo || "Chamado sem título"}
                </Typography>

                {/* Código do equipamento */}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Equipamento: {chamado.equipamento || "N/A"}
                </Typography>

                {/* Status e prioridade */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                    />
                    <Chip
                        label={`Prioridade: ${chamado.prioridade || "N/A"}`}
                        color="warning"
                        size="small"
                    />
                </Box>

                {/* Botão para ver detalhes */}
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleVerDetalhes(chamado.id)}
                >
                    Ver Detalhes
                </Button>
            </Box>
        </Card>
    );
};

export default ChamadosCard;