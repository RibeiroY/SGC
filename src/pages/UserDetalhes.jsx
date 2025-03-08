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
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/shared/Sidebar';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const UserDetalhes = () => {
  const { id } = useParams(); // ID do usuário a ser exibido
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Usuário logado
  const { enqueueSnackbar } = useSnackbar();

  // Estados para armazenar dados do usuário
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para os dados que serão exibidos
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [setor, setSetor] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [attendedCount, setAttendedCount] = useState(0);

  // O admin logado pode alterar, mas apenas se o usuário exibido NÃO for admin.
  const isAdminEditing = currentUser?.role === 'admin' && role !== 'admin';

  // Verifica se o usuário exibido é o mesmo que o usuário logado
  const isCurrentUser = email === currentUser?.email;

  // Função auxiliar para formatar o lastLogin
  const getFormattedLastLogin = (lastLogin) => {
    if (!lastLogin) return "Sem registro";
    let date;
    if (lastLogin instanceof Date) {
      date = lastLogin;
    } else if (typeof lastLogin.toDate === "function") {
      date = lastLogin.toDate();
    } else {
      date = new Date(lastLogin);
    }
    if (isNaN(date.getTime())) {
      return "Sem registro";
    }
    return format(date, "dd/MM/yyyy HH:mm");
  };

  // Redireciona se o usuário não estiver logado
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Busca os detalhes do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, 'usernames', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({ id: docSnap.id, ...data });
          setUsername(data.username);
          setDisplayName(data.displayName);
          setEmail(data.email);
          setRole(data.role);
          setSetor(data.setor || '');
          setIsActive(data.isActive ?? true);
          setLoading(false);
        } else {
          enqueueSnackbar('Usuário não encontrado!', { variant: 'error' });
          navigate('/usuarios');
        }
      } catch (error) {
        enqueueSnackbar('Erro ao buscar dados do usuário.', { variant: 'error' });
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate, enqueueSnackbar]);

  // Busca a quantidade de chamados atendidos pelo usuário (se for technician ou admin)
  useEffect(() => {
    const fetchAttendedCount = async () => {
      if (user && (user.role === 'technician' || user.role === 'admin')) {
        try {
          const chamadosRef = collection(db, 'chamados');
          const snapshot = await getDocs(chamadosRef);
          let count = 0;
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Verifica se o uid do usuário está na lista de atendentes do chamado
            if (data.atendentes && Array.isArray(data.atendentes)) {
              if (data.atendentes.some(att => att.uid === user.uid)) {
                count++;
              }
            }
          });
          setAttendedCount(count);
        } catch (error) {
          console.error('Erro ao buscar chamados atendidos:', error);
        }
      }
    };
    fetchAttendedCount();
  }, [user]);

  // Função para atualizar o usuário – apenas campos editáveis
  const handleUpdateUser = async () => {
    try {
      const userRef = doc(db, 'usernames', id);
      await updateDoc(userRef, {
        role,
        setor,
        isActive,
      });
      enqueueSnackbar('Usuário atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar o usuário.', { variant: 'error' });
    }
  };

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
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            textAlign: { xs: 'center', md: 'left' },
            color: '#4A148C',
          }}
        >
          Detalhes do Usuário: {username}
        </Typography>
        <Divider />

        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            boxShadow: 3,
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Dados Básicos */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Nome Completo (Display Name):
          </Typography>
          <TextField
            fullWidth
            value={displayName}
            margin="normal"
            disabled
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiInputBase-root': { borderRadius: '4px' },
            }}
          />

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Nome de Usuário:
          </Typography>
          <TextField
            fullWidth
            value={username}
            margin="normal"
            disabled
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiInputBase-root': { borderRadius: '4px' },
            }}
          />

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            E-mail:
          </Typography>
          <TextField
            fullWidth
            value={email}
            margin="normal"
            disabled
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiInputBase-root': { borderRadius: '4px' },
            }}
          />

          {/* Exibe o Último Login */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Último Login:
          </Typography>
          <TextField
            fullWidth
            value={
              user.lastLogin
                ? getFormattedLastLogin(user.lastLogin)
                : "Sem registro"
            }
            margin="normal"
            disabled
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiInputBase-root': { borderRadius: '4px' },
            }}
          />

          {/* Dados Editáveis pelo Admin (se permitido) */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Função:
          </Typography>
          <FormControl fullWidth margin="normal" disabled={!isAdminEditing}>
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

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Setor:
          </Typography>
          <FormControl fullWidth margin="normal">
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

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6A1B9A' }}>
            Status:
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={isActive ? 'ativo' : 'inativo'}
              onChange={(e) => setIsActive(e.target.value === 'ativo')}
              label="Status"
              disabled={isCurrentUser || role === 'admin'} // Desabilita se for o próprio usuário
            >
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>

          {/* Exibição da quantidade de chamados atendidos (se aplicável) */}
          {(role === 'technician' || role === 'admin') && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#283593' }}>
                Chamados Atendidos:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#283593' }}>
                {attendedCount}
              </Typography>
            </Box>
          )}

          {/* Botão de Atualização (apenas se houver permissão) */}
          {isAdminEditing && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateUser}
              sx={{
                mt: 3,
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
              Atualizar Dados
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default UserDetalhes;
