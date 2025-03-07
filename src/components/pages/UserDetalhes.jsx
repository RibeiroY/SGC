import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    CircularProgress,
} from '@mui/material';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import { useSnackbar } from 'notistack';

const UserDetalhes = () => {
    const { id } = useParams(); // Obtém o ID do usuário da URL
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Obtém o usuário logado
    const [user, setUser] = useState(null); // Estado para armazenar os detalhes do usuário
    const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
    const { enqueueSnackbar } = useSnackbar();

    // Estados para edição
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [setor, setSetor] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Verifica se o usuário é administrador
    const isAdmin = currentUser?.role === 'admin';

    // Efeito para redirecionar se o usuário não estiver logado
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // Busca os detalhes do usuário
    useEffect(() => {
        const fetchUser = async () => {
            const docRef = doc(db, 'usernames', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUser({ id: docSnap.id, ...data });
                setUsername(data.username);
                setEmail(data.email);
                setRole(data.role);
                setSetor(data.setor || '');
                setIsActive(data.isActive || true);
                setLoading(false);
            } else {
                enqueueSnackbar('Usuário não encontrado!', { variant: 'error' });
                navigate('/usuarios'); // Redireciona para a lista de usuários
            }
        };

        fetchUser();
    }, [id, navigate, enqueueSnackbar]);

    // Função para atualizar o usuário
    const handleUpdateUser = async () => {
        try {
            const userRef = doc(db, 'usernames', id);
            await updateDoc(userRef, {
                username,
                email,
                role,
                setor,
                isActive,
            });
            enqueueSnackbar('Usuário atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar o usuário.', { variant: 'error' });
        }
    };

    // Se ainda não carregou o usuário ou o currentUser estiver nulo, exibe uma mensagem de carregamento
    if (loading || !currentUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f0f0f0' }}>
                {/* Título do usuário */}
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: 'bold',
                        textAlign: { xs: 'center', md: 'left' },
                        color: '#4A148C',
                    }}
                >
                    Detalhes do Usuário: {user.username}
                </Typography>
                <Divider />
                {/* Detalhes do Usuário */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 4,
                        boxShadow: 3,
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    {/* Nome do Usuário */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                        Nome de Usuário:
                    </Typography>
                    <TextField
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        disabled={!isAdmin}
                    />
                    <Divider sx={{ my: 2 }} />
                    {/* E-mail do Usuário */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                        E-mail:
                    </Typography>
                    <TextField
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        disabled={!isAdmin}
                    />
                    <Divider sx={{ my: 2 }} />
                    {/* Role do Usuário */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                        Função:
                    </Typography>
                    <FormControl fullWidth margin="normal" disabled={!isAdmin}>
                        <InputLabel>Função</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            label="Função"
                        >
                            <MenuItem value="admin">Administrador</MenuItem>
                            <MenuItem value="technician">Técnico</MenuItem>
                            <MenuItem value="user">Usuário</MenuItem>
                        </Select>
                    </FormControl>
                    <Divider sx={{ my: 2 }} />
                    {/* Setor do Usuário */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                        Setor:
                    </Typography>
                    <FormControl fullWidth margin="normal" disabled={!isAdmin}>
                        <InputLabel>Setor</InputLabel>
                        <Select
                            value={setor}
                            onChange={(e) => setSetor(e.target.value)}
                            label="Setor"
                        >
                            <MenuItem value="TI">TI</MenuItem>
                            <MenuItem value="Administração">Administração</MenuItem>
                            <MenuItem value="Jurídico">Jurídico</MenuItem>
                            <MenuItem value="Financeiro">Financeiro</MenuItem>
                            <MenuItem value="RH">RH</MenuItem>
                            <MenuItem value="Marketing">Marketing</MenuItem>
                            <MenuItem value="Vendas">Vendas</MenuItem>
                            <MenuItem value="Recepção">Recepção</MenuItem>
                        </Select>
                    </FormControl>
                    <Divider sx={{ my: 2 }} />
                    {/* Status do Usuário */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                        Status:
                    </Typography>
                    <FormControl fullWidth margin="normal" disabled={!isAdmin}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={isActive ? 'ativo' : 'inativo'}
                            onChange={(e) => setIsActive(e.target.value === 'ativo')}
                            label="Status"
                        >
                            <MenuItem value="ativo">Ativo</MenuItem>
                            <MenuItem value="inativo">Inativo</MenuItem>
                        </Select>
                    </FormControl>
                    {/* Botão de Atualização */}
                    {isAdmin && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateUser}
                            sx={{
                                mt: 2,
                                borderRadius: 2,
                                padding: '12px 24px',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: 2,
                                backgroundColor: '#6A1B9A',
                                color: '#FFFFFF',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#4A148C',
                                    boxShadow: 4,
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            Atualizar Usuário
                        </Button>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default UserDetalhes;