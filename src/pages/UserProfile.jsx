import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Divider, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Sidebar from '../components/shared/Sidebar';
import { formatInTimeZone } from 'date-fns-tz';
import { useUsers } from '../hooks/useUsers';
import { db } from '../firebase/firebase';
import {collection, getDocs } from 'firebase/firestore';

const UserProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
    const [attendedCount, setAttendedCount] = useState(0);
    const [userSetor, setUserSetor] = useState('');

    const {
        handleUpdateDisplayName,
        handleUpdatePassword,
    } = useUsers();

    // Verificação de autenticação
    useEffect(() => {
        if (!currentUser) {
            navigate('/login'); // Redireciona para login se o usuário não estiver autenticado
        } else {
            setDisplayName(currentUser.displayName || '');
            setEmail(currentUser.email || '');
            fetchAttendedCount();
            fetchUserSetor();
        }
    }, [currentUser, navigate]);

    // Função para buscar o setor do usuário logado
    const fetchUserSetor = async () => {
        try {
            const usersRef = collection(db, "usernames");
            const querySnapshot = await getDocs(usersRef);
            let userDoc = null;

            querySnapshot.forEach((docSnap) => {
                if (docSnap.data().email === currentUser.email) {
                    userDoc = docSnap;
                }
            });

            if (userDoc) {
                const data = userDoc.data();
                setUserSetor(data.setor || 'Setor não definido');
            } else {
                setUserSetor('Setor não definido');
            }
        } catch (error) {
            console.error('Erro ao buscar o setor:', error);
            setUserSetor('Erro ao buscar setor');
        }
    };

    // Função para buscar a quantidade de chamados atendidos
    const fetchAttendedCount = async () => {
        try {
            const chamadosRef = collection(db, 'chamados');
            const snapshot = await getDocs(chamadosRef);
            let count = 0;
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.atendentes && Array.isArray(data.atendentes)) {
                    if (data.atendentes.some(att => att.uid === currentUser.uid)) {
                        count++;
                    }
                }
            });
            setAttendedCount(count);
        } catch (error) {
            console.error('Erro ao buscar chamados atendidos:', error);
            enqueueSnackbar('Erro ao buscar chamados atendidos.', { variant: 'error' });
        }
    };

    const formatDateToSP = (dateString) => {
        return formatInTimeZone(new Date(dateString), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
    };

    const handleUpdateDisplayNameClick = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await handleUpdateDisplayName(displayName);
            enqueueSnackbar('Nome de exibição atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar o nome de exibição.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePasswordClick = async () => {
        if (loading) return;

        if (newPassword !== confirmPassword) {
            enqueueSnackbar('As senhas não coincidem!', { variant: 'error' });
            return;
        }

        setLoading(true);
        setIsPasswordUpdating(true);

        try {
            await handleUpdatePassword(currentPassword, newPassword);
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar a senha.', { variant: 'error' });
        } finally {
            setLoading(false);
            setIsPasswordUpdating(false);
        }
    };

    if (!currentUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2B1432', color: '#fff' }}>
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2 }}>Carregando...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh', marginLeft: { xs: 0, md: 30 } }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5' }}>
                    Meu Perfil
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#fff', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6A1B9A', mb: 2 }}>
                        Informações Gerais
                    </Typography>
                    <TextField
                        fullWidth
                        label="Nome de Exibição"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        margin="normal"
                        disabled={isPasswordUpdating}
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="E-mail"
                        value={email}
                        margin="normal"
                        disabled
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="Setor"
                        value={userSetor}
                        margin="normal"
                        disabled
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="Data de Criação da Conta"
                        value={formatDateToSP(currentUser.metadata.creationTime)}
                        margin="normal"
                        disabled
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="Último Login"
                        value={formatDateToSP(currentUser.metadata.lastSignInTime)}
                        margin="normal"
                        disabled
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateDisplayNameClick}
                        disabled={isPasswordUpdating}
                        sx={{
                            mt: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            backgroundColor: '#6A1B9A',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#4A148C',
                                boxShadow: 4,
                            },
                        }}
                    >
                        Atualizar Nome de Exibição
                    </Button>
                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#283593' }}>
                            Chamados Atendidos
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#283593' }}>
                            {attendedCount}
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6A1B9A', mb: 2 }} >
                        Alterar Senha
                    </Typography>
                    <TextField
                        fullWidth
                        label="Senha Atual"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        margin="normal"
                        disabled={isPasswordUpdating}
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="Nova Senha"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        margin="normal"
                        disabled={isPasswordUpdating}
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <TextField
                        fullWidth
                        label="Confirmar Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        disabled={isPasswordUpdating}
                        sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleUpdatePasswordClick}
                        disabled={isPasswordUpdating}
                        sx={{
                            mt: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            backgroundColor: '#F96822',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#e55d1d',
                                boxShadow: 4,
                            },
                        }}
                    >
                        Atualizar Senha
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default UserProfile;