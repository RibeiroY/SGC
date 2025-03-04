import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
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
import { toast } from 'react-toastify'; // Para exibir feedback visual
import 'react-toastify/dist/ReactToastify.css';

const ChamadoDetalhes = () => {
    const { id } = useParams(); // Obtém o ID do chamado da URL
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Obtém o usuário logado
    const [chamado, setChamado] = useState(null); // Estado para armazenar os detalhes do chamado
    const { messages, loading, sendMessage } = useChats(id); // Usa o hook atualizado do chat
    const [newMessage, setNewMessage] = useState(''); // Estado para armazenar a nova mensagem
    const [status, setStatus] = useState(''); // Estado para o status do chamado
    const [prioridade, setPrioridade] = useState(''); // Estado para a prioridade do chamado

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
            toast.success('Status atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar o status.');
        }
    };

    // Função para atualizar a prioridade do chamado
    const handlePrioridadeChange = async (newPrioridade) => {
        try {
            const chamadoRef = doc(db, 'chamados', id);
            await updateDoc(chamadoRef, { prioridade: newPrioridade });
            setPrioridade(newPrioridade); // Atualiza o estado local
            toast.success('Prioridade atualizada com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar a prioridade.');
        }
    };

    // Função para enviar uma nova mensagem
    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        await sendMessage(
            currentUser?.uid,
            currentUser?.displayName || "Usuário Anônimo",
            newMessage
        );

        setNewMessage(''); // Limpa o campo de mensagem
    };

    // Se ainda não carregou o chamado ou o currentUser estiver nulo, exibe uma mensagem de carregamento
    if (!chamado || !currentUser) {
        return <Typography>Carregando...</Typography>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3 }}>
                {/* Título do chamado */}
                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 3, 
                        fontWeight: 'bold', 
                        color: '#4A148C', 
                        textAlign: { xs: 'center', md: 'left' } 
                    }}
                >
                    Bate-papo para o chamado {chamado.id}
                </Typography>

                {/* Detalhes do Chamado */}
                <Paper 
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 4, 
                        boxShadow: 3, 
                        backgroundColor: '#FAFAFA' 
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}
                    >
                        Título do Chamado: {chamado.titulo || "N/A"}
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
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="aberto">Aberto</MenuItem>
                                <MenuItem value="em atendimento">Em Atendimento</MenuItem>
                                <MenuItem value="fechado">Fechado</MenuItem>
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
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="baixa">Baixa</MenuItem>
                                <MenuItem value="média">Média</MenuItem>
                                <MenuItem value="alta">Alta</MenuItem>
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            {prioridade}
                        </Typography>
                    )}
                </Paper>

                {/* Bate-papo */}
                <Paper 
                    sx={{ 
                        p: 3, 
                        borderRadius: 4, 
                        boxShadow: 3, 
                        backgroundColor: '#FAFAFA' 
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
                            sx={{
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            sx={{
                                borderRadius: 2,
                                padding: '12px 24px',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
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
