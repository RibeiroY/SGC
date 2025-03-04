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
  InputLabel 
} from '@mui/material';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import useChats from '../../hooks/useChats'; // Hook atualizado do chat
import { format } from 'date-fns'; // Biblioteca para formatação de datas
import { useSnackbar } from 'notistack';

const ChamadoDetalhes = () => {
    const { id } = useParams(); // Obtém o ID do chamado da URL
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Obtém o usuário logado
    const [chamado, setChamado] = useState(null); // Estado para armazenar os detalhes do chamado
    const { messages, loading, sendMessage } = useChats(id); // Usa o hook atualizado do chat
    const [newMessage, setNewMessage] = useState(''); // Estado para armazenar a nova mensagem
    const [status, setStatus] = useState(''); // Estado para o status do chamado
    const [prioridade, setPrioridade] = useState(''); // Estado para a prioridade do chamado
    const [tipo, setTipo] = useState(''); // Estado para o tipo do chamado
    const { enqueueSnackbar } = useSnackbar();

    // Verifica se o usuário é técnico ou administrador
    const isTechnicianOrAdmin = currentUser?.role === 'technician' || currentUser?.role === 'admin';

    // Efeito para redirecionar se o usuário não estiver logado
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // Busca os detalhes do chamado
    useEffect(() => {
        const fetchChamado = async () => {
            const docRef = doc(db, 'chamados', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setChamado({ id: docSnap.id, ...data });
                setStatus(data.status); // Define o estado inicial do status
                setPrioridade(data.prioridade); // Define o estado inicial da prioridade
                setTipo(data.tipo); // Define o estado inicial do tipo
            } else {
                console.log("Chamado não encontrado!");
            }
        };

        fetchChamado();
    }, [id]);

    // Função para atualizar o status do chamado
    const handleStatusChange = async (newStatus) => {
        try {
            const chamadoRef = doc(db, 'chamados', id);
            await updateDoc(chamadoRef, { status: newStatus });
            setStatus(newStatus); // Atualiza o estado local
            enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar o status.', { variant: 'error' });
        }
    };

    // Função para atualizar a prioridade do chamado
    const handlePrioridadeChange = async (newPrioridade) => {
        try {
            const chamadoRef = doc(db, 'chamados', id);
            await updateDoc(chamadoRef, { prioridade: newPrioridade });
            setPrioridade(newPrioridade); // Atualiza o estado local
            enqueueSnackbar('Prioridade atualizada com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar a prioridade.', { variant: 'error' });
        }
    };

    // Função para atualizar o tipo do chamado
    const handleTipoChange = async (newTipo) => {
        try {
            const chamadoRef = doc(db, 'chamados', id);
            await updateDoc(chamadoRef, { tipo: newTipo });
            setTipo(newTipo); // Atualiza o estado local
            enqueueSnackbar('Tipo atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Erro ao atualizar o tipo.', { variant: 'error' });
        }
    };

    // Função para enviar uma nova mensagem
    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        // Verifica se o status do chamado é "Fechado"
        if (status === 'Fechado') {
            enqueueSnackbar('Não é possível enviar mensagens em um chamado fechado.', { variant: 'error' });
            return;
        }

        await sendMessage(
            currentUser?.uid,
            currentUser?.displayName || "Usuário Anônimo",
            newMessage
        );

        setNewMessage(''); // Limpa o campo de mensagem
    };

    // Função para obter a cor com base na prioridade
    const getPrioridadeColor = (prioridade) => {
        switch (prioridade) {
            case 'Baixa':
                return '#4CAF50'; // Verde
            case 'Média':
                return '#FF9800'; // Laranja
            case 'Alta':
                return '#F44336'; // Vermelho
            default:
                return '#000000'; // Preto (padrão)
        }
    };

    // Se ainda não carregou o chamado ou o currentUser estiver nulo, exibe uma mensagem de carregamento
    if (!chamado || !currentUser) {
        return <Typography>Carregando...</Typography>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f0f0f0' }}>
                {/* Título do chamado */}
                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 3, 
                        fontWeight: 'bold', 
                        textAlign: { xs: 'center', md: 'left' },
                        color: '#4A148C',
                    }}
                >
                    Ordem de serviço: {chamado.id}
                </Typography>

                {/* Detalhes do Chamado */}
                <Paper 
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 4, 
                        boxShadow: 3, 
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Assunto da OS: {chamado.titulo || "N/A"}
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Descrição:
                    </Typography>
                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                        {chamado.descricao}
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Equipamento:
                    </Typography>
                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                        {chamado.equipamento}
                    </Typography>

                    {/* Status do Chamado */}
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Status:
                    </Typography>
                    {isTechnicianOrAdmin ? (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                label="Status"
                                sx={{ 
                                    borderRadius: 2,
                                    backgroundColor: '#FFFFFF',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6A1B9A',
                                    },
                                }}
                            >
                                <MenuItem value="Aberto">Aberto</MenuItem>
                                <MenuItem value="Em Atendimento">Em Atendimento</MenuItem>
                                <MenuItem value="Fechado">Fechado</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            {status}
                        </Typography>
                    )}

                    {/* Prioridade do Chamado */}
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Prioridade:
                    </Typography>
                    {isTechnicianOrAdmin ? (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Prioridade</InputLabel>
                            <Select
                                value={prioridade}
                                onChange={(e) => handlePrioridadeChange(e.target.value)}
                                label="Prioridade"
                                sx={{
                                    borderRadius: 2,
                                    color: getPrioridadeColor(prioridade),
                                    fontWeight: 'bold',
                                    backgroundColor: '#FFFFFF',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6A1B9A',
                                    },
                                }}
                            >
                                <MenuItem value="Baixa" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Baixa</MenuItem>
                                <MenuItem value="Média" sx={{ color: '#FF9800', fontWeight: 'bold' }}>Média</MenuItem>
                                <MenuItem value="Alta" sx={{ color: '#F44336', fontWeight: 'bold' }}>Alta</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography 
                            sx={{ 
                                mb: 2, 
                                color: getPrioridadeColor(prioridade),
                                fontWeight: 'bold',
                            }}
                        >
                            {prioridade}
                        </Typography>
                    )}

                    {/* Tipo do Chamado */}
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Tipo:
                    </Typography>
                    {isTechnicianOrAdmin ? (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={tipo}
                                onChange={(e) => handleTipoChange(e.target.value)}
                                label="Tipo"
                                sx={{ 
                                    borderRadius: 2,
                                    backgroundColor: '#FFFFFF',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6A1B9A',
                                    },
                                }}
                            >
                                <MenuItem value="Requisição">Requisição</MenuItem>
                                <MenuItem value="Incidente">Incidente</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            {tipo}
                        </Typography>
                    )}
                </Paper>

                {/* Bate-papo */}
                <Paper 
                    sx={{ 
                        p: 3, 
                        borderRadius: 4, 
                        boxShadow: 3, 
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Bate-papo
                    </Typography>

                    {/* Lista de Mensagens com balões */}
                    <Box 
                        sx={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto', 
                            mb: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1 
                        }}
                    >
                        {loading ? (
                            <Typography>Carregando mensagens...</Typography>
                        ) : (
                            messages.map((msg) => {
                                const isCurrentUser = msg.senderId === currentUser?.uid;
                                return (
                                    <Box
                                        key={msg.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <Paper
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 4,
                                                maxWidth: '70%',
                                                bgcolor: isCurrentUser ? '#4CAF50' : '#2196F3',
                                                color: '#fff',
                                                boxShadow: 2,
                                                transition: 'transform 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                }
                                            }}
                                        >
                                            <Typography 
                                                variant="caption" 
                                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                {msg.senderName} - {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm:ss') : '...'}
                                            </Typography>
                                            <Typography variant="body1">
                                                {msg.text}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                );
                            })
                        )}
                    </Box>

                    {/* Campo para enviar nova mensagem */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            variant="outlined"
                            disabled={status === 'Fechado'} // Desabilita o campo se o status for "Fechado"
                            sx={{
                                borderRadius: 2,
                                backgroundColor: '#FFFFFF',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={status === 'Fechado'} // Desabilita o botão se o status for "Fechado"
                            sx={{
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
                            Enviar
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ChamadoDetalhes;