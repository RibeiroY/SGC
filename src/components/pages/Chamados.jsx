import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider, useMediaQuery } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import ChamadoDialog from '../../components/ChamadoDialog';
import ChamadosTable from '../../components/ChamadosTable';
import ChamadosCard from '../../components/ChamadosCard';
import { db } from '../../firebase/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

const Chamados = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [chamados, setChamados] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    // Utiliza a mesma técnica de USERS para verificar se é mobile
    const isMobile = useMediaQuery('(max-width:768px)');

    // Busca os dados do usuário na coleção "usernames"
    const fetchUserProfile = async () => {
        if (!currentUser) return;
        try {
            const q = query(
                collection(db, 'usernames'),
                where('uid', '==', currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setUserProfile(querySnapshot.docs[0].data());
            } else {
                console.warn('Perfil do usuário não encontrado na coleção usernames.');
            }
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
        }
    };

    // Busca os chamados do Firestore
    const fetchChamados = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'chamados'));
            const chamadosData = [];
            querySnapshot.forEach((docSnap) => {
                chamadosData.push({ id: docSnap.id, ...docSnap.data() });
            });
            console.log('Todos os chamados:', chamadosData);

            // Se o usuário não for admin ou technician, filtra os chamados com base no setor e username
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

    // Atualiza um chamado no Firestore
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
        // Evita loop infinito; note que a dependência de userProfile pode causar chamadas extras
        // Se necessário, ajuste a lógica para evitar re-fetching desnecessário
    }, [currentUser, userProfile]);

    // Redireciona para a página de login se o usuário não estiver logado
    if (!currentUser) {
        navigate("/login");
        return null;
    }

    // Define se o usuário pode editar status e prioridade (somente admin ou technician)
    const editable = currentUser.role === 'admin' || currentUser.role === 'technician';

    // Funções para abertura e fechamento do diálogo de criação de chamado
    const handleCreateChamado = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        fetchChamados();
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box
                sx={{
                    flex: 1,
                    padding: 3,
                    backgroundColor: "#f4f4f4",
                    minHeight: "100vh",
                    marginLeft: { md: 30 }
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Gerenciar Ordens de Serviço
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleCreateChamado}
                    sx={{
                        mb: 3,
                        width: '100%',
                        textTransform: 'none',
                        backgroundColor: '#F96822',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#e55d1d'
                        }
                    }}
                >
                    Criar Novo Chamado
                </Button>
                <Divider sx={{ mb: 3 }} />
                {isMobile ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {chamados.map((chamado) => (
                            <ChamadosCard key={chamado.id} chamado={chamado} />
                        ))}
                    </Box>
                ) : (
                    <ChamadosTable chamados={chamados} updateChamado={updateChamado} editable={editable} />
                )}
                <ChamadoDialog open={openDialog} onClose={handleCloseDialog} />
            </Box>
        </Box>
    );
};

export default Chamados;
