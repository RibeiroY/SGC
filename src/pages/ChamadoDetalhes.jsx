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
  Divider 
} from '@mui/material';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/shared/Sidebar';
import useChats from '../hooks/useChats';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

const ChamadoDetalhes = () => {
  const { id } = useParams(); // ID do chamado
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Usuário autenticado
  const [chamado, setChamado] = useState(null); // Dados do chamado
  const { messages, loading, sendMessage } = useChats(id); // Chat em tempo real
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [tipo, setTipo] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Verifica se o usuário é técnico ou admin
  const isTechnicianOrAdmin = currentUser?.role === 'technician' || currentUser?.role === 'admin';
  // Controle se o usuário já clicou em "Atender"
  const [atendido, setAtendido] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Listener em tempo real do chamado (inclui atendentes)
  useEffect(() => {
    const docRef = doc(db, 'chamados', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChamado({ id: docSnap.id, ...data });
        setStatus(data.status);
        setPrioridade(data.prioridade);
        setTipo(data.tipo);
        // Verifica se o usuário já está no array de atendentes
        if (data.atendentes && Array.isArray(data.atendentes)) {
          const jaAtendeu = data.atendentes.some(att => att.uid === currentUser?.uid);
          setAtendido(jaAtendeu);
        } else {
          setAtendido(false);
        }
      } else {
        console.log("Chamado não encontrado!");
      }
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  // Função para atualizar as informações do atendente
  const updateAtendenteInfo = async (uid, displayName, email) => {
    const chamadosRef = collection(db, 'chamados');
    const q = query(chamadosRef, where('atendentes.uid', '==', uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (chamadoDoc) => {
      const chamadoRef = doc(db, 'chamados', chamadoDoc.id);
      const chamadoData = chamadoDoc.data();
      
      if (chamadoData.atendentes) {
        const updatedAtendentes = chamadoData.atendentes.map(att => {
          if (att.uid === uid) {
            return { ...att, displayName, email }; // Atualiza as informações do atendente
          }
          return att;
        });

        await updateDoc(chamadoRef, { atendentes: updatedAtendentes });
      }
    });
  };

  // Atualiza status, prioridade e tipo
  const handleStatusChange = async (newStatus) => {
    try {
      await updateDoc(doc(db, 'chamados', id), { status: newStatus });
      enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar o status.', { variant: 'error' });
    }
  };

  const handlePrioridadeChange = async (newPrioridade) => {
    try {
      await updateDoc(doc(db, 'chamados', id), { prioridade: newPrioridade });
      enqueueSnackbar('Prioridade atualizada com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar a prioridade.', { variant: 'error' });
    }
  };

  const handleTipoChange = async (newTipo) => {
    try {
      await updateDoc(doc(db, 'chamados', id), { tipo: newTipo });
      enqueueSnackbar('Tipo atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar o tipo.', { variant: 'error' });
    }
  };

  // Função para "atender" o chamado – registra os dados do atendente no campo "atendentes"
  const handleAtender = async () => {
    if (!isTechnicianOrAdmin) return;
    try {
      const chamadoRef = doc(db, 'chamados', id);

      await updateDoc(chamadoRef, {
        atendentes: arrayUnion({
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Sem Nome",
          email: currentUser.email
        })
      });
      enqueueSnackbar('Você iniciou o atendimento deste chamado!', { variant: 'success' });
      setAtendido(true);
    } catch (error) {
      console.error("Erro ao marcar como atendido:", error);
      enqueueSnackbar('Erro ao iniciar o atendimento.', { variant: 'error' });
    }
  };

  // Envio de mensagem
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (status === 'Fechado') {
      enqueueSnackbar('Não é possível enviar mensagens em um chamado fechado.', { variant: 'error' });
      return;
    }
    await sendMessage(
      currentUser?.uid,
      currentUser?.displayName || "Usuário Anônimo",
      newMessage
    );
    setNewMessage('');
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'Baixa': return '#4CAF50';
      case 'Média': return '#FF9800';
      case 'Alta': return '#F44336';
      default: return '#000000';
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const { displayName, email } = userData;

        // Atualiza as informações do atendente nos chamados
        await updateAtendenteInfo(currentUser.uid, displayName, email);
      }
    });

    return () => unsubscribeUser();
  }, [currentUser]);

  if (!chamado || !currentUser) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f0f0f0' }}>
        <Typography 
          variant="h4" 
          sx={{ mb: 3, fontWeight: 'bold', textAlign: { xs: 'center', md: 'left' }, color: '#4A148C' }}
        >
          Ordem de serviço: {chamado.id}
        </Typography>
        <Divider />

        {/* Detalhes do Chamado */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Assunto da OS: {chamado.titulo || "N/A"}
          </Typography>
          <Divider />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Descrição:
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            {chamado.descricao}
          </Typography>
          <Divider />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Equipamento:
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            {chamado.equipamento || "Chamado geral para setor"}
          </Typography>
          <Divider />
          {/* Exibe o setor do equipamento, se disponível */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Setor do Equipamento:
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            {chamado.setor || "N/A"}
          </Typography>
          <Divider />

          {/* Exibição dos atendentes */}
          {chamado.atendentes && chamado.atendentes.length > 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
                Atendentes:
              </Typography>
              {chamado.atendentes.map((att, idx) => (
                <Typography key={idx} sx={{ mb: 1, color: 'text.secondary' }}>
                  {att.displayName} ({att.email})
                </Typography>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Status do Chamado */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
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
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6A1B9A' },
                }}
              >
                <MenuItem value="Aberto">Aberto</MenuItem>
                <MenuItem value="Em Atendimento">Em Atendimento</MenuItem>
                <MenuItem value="Fechado">Fechado</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>{status}</Typography>
          )}
          <Divider />

          {/* Prioridade do Chamado */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
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
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6A1B9A' },
                }}
              >
                <MenuItem value="Baixa" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Baixa</MenuItem>
                <MenuItem value="Média" sx={{ color: '#FF9800', fontWeight: 'bold' }}>Média</MenuItem>
                <MenuItem value="Alta" sx={{ color: '#F44336', fontWeight: 'bold' }}>Alta</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ mb: 2, color: getPrioridadeColor(prioridade), fontWeight: 'bold' }}>
              {prioridade}
            </Typography>
          )}
          <Divider />

          {/* Tipo do Chamado */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
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
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#6A1B9A' },
                }}
              >
                <MenuItem value="Requisição">Requisição</MenuItem>
                <MenuItem value="Incidente">Incidente</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>{tipo}</Typography>
          )}
        </Paper>
        <Divider />
        {/* Botão "Atender" para técnicos/admin */}
        {isTechnicianOrAdmin && !atendido && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAtender}
              sx={{
                width: '100%',
                textTransform: 'none',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                '&:hover': { backgroundColor: '#43A047' }
              }}
            >
              Atender
            </Button>
          </Box>
        )}

        {/* Área de Bate-papo */}
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Bate-papo
          </Typography>
          <Divider />
          {/* Lista de Mensagens */}
          <Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading ? (
              <Typography>Carregando mensagens...</Typography>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.senderId === currentUser?.uid;
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 4,
                        maxWidth: '70%',
                        bgcolor: isCurrentUser ? '#4CAF50' : '#2196F3',
                        color: '#fff',
                        boxShadow: 2,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': { transform: 'scale(1.02)' }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {msg.senderName} - {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm:ss') : '...'}
                      </Typography>
                      <Typography variant="body1">{msg.text}</Typography>
                    </Paper>
                  </Box>
                );
              })
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Formulário para enviar nova mensagem */}
          <Box 
            component="form" 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            sx={{ display: 'flex', gap: 2 }}
          >
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              variant="outlined"
              disabled={status === 'Fechado' || (isTechnicianOrAdmin && !atendido)}
              sx={{
                borderRadius: 2,
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={status === 'Fechado' || (isTechnicianOrAdmin && !atendido)}
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
          {isTechnicianOrAdmin && !atendido && (
            <Typography variant="body2" sx={{ mt: 2, color: 'red' }}>
              Para enviar mensagens, clique em "Atender".
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ChamadoDetalhes;
