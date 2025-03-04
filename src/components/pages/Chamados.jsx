import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import ChamadoDialog from '../../components/ChamadoDialog';
import ChamadosTable from '../../components/ChamadosTable';
import ChamadosCard from '../../components/ChamadosCard'; // Importe o novo componente
import { db } from '../../firebase/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const Chamados = () => {
    const { currentUser } = useAuth(); // Verifica se o usuário está autenticado
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false); // Estado para controlar a abertura do diálogo
    const [chamados, setChamados] = useState([]); // Estado para armazenar a lista de chamados

    // Verifica se a tela é mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Função para buscar os chamados do Firestore
    const fetchChamados = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'chamados'));
            const chamadosData = [];
            querySnapshot.forEach((doc) => {
                chamadosData.push({ id: doc.id, ...doc.data() });
            });
            setChamados(chamadosData);
        } catch (error) {
            console.error('Erro ao buscar chamados:', error);
        }
    };

    // Função para atualizar um chamado no Firestore
    const updateChamado = async (chamadoId, newData) => {
        try {
            await updateDoc(doc(db, 'chamados', chamadoId), newData);
            fetchChamados(); // Atualiza a lista de chamados após a edição
        } catch (error) {
            console.error('Erro ao atualizar chamado:', error);
        }
    };

    // Busca os chamados ao carregar o componente
    useEffect(() => {
        fetchChamados();
    }, []);

    // Verifica se o usuário está logado
    if (!currentUser) {
        navigate("/login");
        return null; // Retorna null para evitar renderização adicional
    }

    // Função para abrir o diálogo de criação de chamado
    const handleCreateChamado = () => {
        setOpenDialog(true);
    };

    // Função para fechar o diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
        fetchChamados(); // Atualiza a lista de chamados após criar um novo
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <Container maxWidth="lg" sx={{ flexGrow: 1, paddingTop: 3, marginLeft: { md: 30 }, backgroundColor: "#f4f4f4" }}>
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

                {/* Exibe a tabela ou os cards com base no tamanho da tela */}
                {isMobile ? (
                    <Box>
                        {chamados.map((chamado) => (
                            <ChamadosCard key={chamado.id} chamado={chamado} />
                        ))}
                    </Box>
                ) : (
                    <ChamadosTable chamados={chamados} updateChamado={updateChamado} />
                )}

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