import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, useMediaQuery, useTheme, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import ChamadoDialog from '../../components/ChamadoDialog';
import ChamadosTable from '../../components/ChamadosTable';
import ChamadosCard from '../../components/ChamadosCard'; // Importe o novo componente
import { db } from '../../firebase/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

const Chamados = () => {
    const { currentUser } = useAuth(); // Obtém o usuário logado do contexto de autenticação
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false); // Controle para o diálogo de novo chamado
    const [chamados, setChamados] = useState([]); // Lista de chamados
    const [userProfile, setUserProfile] = useState(null); // Dados adicionais do usuário (incluindo setor e username)

    // Verifica se a tela é mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Busca os dados do usuário na coleção "usernames" (onde o setor e o username estão armazenados)
    const fetchUserProfile = async () => {
        if (!currentUser) return;
        try {
            const q = query(
                collection(db, 'usernames'),
                where('uid', '==', currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Assumindo que há apenas um documento para o usuário
                setUserProfile(querySnapshot.docs[0].data());
            } else {
                console.warn('Perfil do usuário não encontrado na coleção usernames.');
            }
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
        }
    };

    // Função para buscar os chamados do Firestore
    const fetchChamados = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'chamados'));
            const chamadosData = [];
            querySnapshot.forEach((docSnap) => {
                chamadosData.push({ id: docSnap.id, ...docSnap.data() });
            });
            console.log('Todos os chamados:', chamadosData);

            // Se o usuário não for admin ou technician e tiver um perfil com setor definido, filtra os chamados.
            // A lógica: para o usuário, exibir chamados que foram abertos por ele (com base no username)
            // OU que pertencem ao mesmo setor que ele.
            if (
                currentUser &&
                userProfile &&
                currentUser.role !== 'admin' &&
                currentUser.role !== 'technician' &&
                userProfile.setor &&
                userProfile.username
            ) {
                const filteredChamados = chamadosData.filter((chamado) => {
                    const setorChamado = chamado.setor ? chamado.setor.toLowerCase().trim() : '';
                    const setorUser = userProfile.setor.toLowerCase().trim();
                    const chamadoAbertoPeloUsuario = chamado.username === userProfile.username;
                    console.log(
                        `Chamado ID: ${chamado.id} - setorChamado: "${setorChamado}", setorUser: "${setorUser}", Aberto por usuário: ${chamadoAbertoPeloUsuario}`
                    );
                    return chamadoAbertoPeloUsuario || setorChamado === setorUser;
                });
                console.log('Chamados filtrados:', filteredChamados);
                setChamados(filteredChamados);
            } else {
                setChamados(chamadosData);
            }
        } catch (error) {
            console.error('Erro ao buscar chamados:', error);
        }
    };

    // Função para atualizar um chamado no Firestore
    const updateChamado = async (chamadoId, newData) => {
        try {
            await updateDoc(doc(db, 'chamados', chamadoId), newData);
            fetchChamados(); // Atualiza a lista após a edição
        } catch (error) {
            console.error('Erro ao atualizar chamado:', error);
        }
    };

    // Busca os chamados e o perfil do usuário quando o currentUser estiver disponível
    useEffect(() => {
        if (currentUser) {
            fetchUserProfile();
            fetchChamados();
        }
    }, [currentUser, userProfile]);

    // Se o usuário não estiver logado, redireciona para a página de login
    if (!currentUser) {
        navigate("/login");
        return null;
    }

    // Define se o usuário pode editar status e prioridade (somente admin ou technician)
    const editable = currentUser.role === 'admin' || currentUser.role === 'technician';

    // Função para abrir o diálogo de criação de chamado
    const handleCreateChamado = () => {
        setOpenDialog(true);
    };

    // Função para fechar o diálogo e atualizar os chamados
    const handleCloseDialog = () => {
        setOpenDialog(false);
        fetchChamados();
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <Container
                maxWidth="lg"
                sx={{
                    flexGrow: 1,
                    paddingTop: 3,
                    marginLeft: { md: 30 },
                    backgroundColor: "#f4f4f4"
                }}
            >
                <Typography
                    variant="h4"
                    sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}
                >
                    Gerenciar Ordens de Serviço
                </Typography>

                {/* Botão para criar novo chamado */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            padding: { xs: '10px 20px', md: '12px 24px' },
                            textTransform: 'none',
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: 2,
                            transition: 'all 0.3s ease',
                            backgroundColor: '#F96822', // Cor laranja
                            color: '#fff',
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
                <Divider sx={{ mb: 3 }} />
                {/* Exibe a tabela ou os cards com base no tamanho da tela */}
                {isMobile ? (
                    <Box>
                        {chamados.map((chamado) => (
                            <ChamadosCard key={chamado.id} chamado={chamado} />
                        ))}
                    </Box>
                ) : (
                    <ChamadosTable chamados={chamados} updateChamado={updateChamado} editable={editable} />
                )}

                {/* Diálogo para criação de chamado */}
                <ChamadoDialog open={openDialog} onClose={handleCloseDialog} />
            </Container>
        </Box>
    );
};

export default Chamados;
