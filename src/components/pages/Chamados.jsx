import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import ChamadoDialog from '../../components/ChamadoDialog'; // Importando o componente

const Chamados = () => {
    const { currentUser } = useAuth(); // Verifica se o usuário está autenticado
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false); // Estado para controlar a abertura do diálogo

    // Verifica se o usuário está logado
    if (!currentUser) {
        navigate("/login");
        return null;
    }

    // Função para abrir o diálogo de criação de chamado
    const handleCreateChamado = () => {
        setOpenDialog(true);
    };

    // Função para fechar o diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <Container maxWidth="lg" sx={{ flexGrow: 1, paddingTop: 3, marginLeft: { md: 30 },backgroundColor: "#f4f4f4" }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                    Gerenciar Chamados
                </Typography>

                {/* Botão para criar novo chamado */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            padding: { xs: '10px 20px', md: '12px 24px' },
                            textTransform: 'none',
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'scale(1.02)',
                            },
                        }}
                        onClick={handleCreateChamado}
                    >
                        Criar Novo Chamado
                    </Button>
                </Box>

                {/* Diálogo para criação de chamado */}
                <ChamadoDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                />
            </Container>
        </Box>
    );
};

export default Chamados;