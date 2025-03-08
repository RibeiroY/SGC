import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Divider, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useSnackbar } from 'notistack';
import Sidebar from '../components/shared/Sidebar';
import { formatInTimeZone } from 'date-fns-tz';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Importe para buscar dados do Firestore
import { db } from '../firebase/firebase'; // Importe o Firestore

const UserProfile = () => {
  const { currentUser } = useAuth(); // Obtém o usuário logado
  const navigate = useNavigate(); // Para redirecionamento
  const { enqueueSnackbar } = useSnackbar(); // Para notificações
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [attendedCount, setAttendedCount] = useState(0); // Estado para armazenar a quantidade de chamados atendidos
  const [userSetor, setUserSetor] = useState(''); // Estado para armazenar o setor do usuário

  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Redireciona para login se não estiver autenticado
    } else {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      fetchAttendedCount(); // Busca a quantidade de chamados atendidos
      fetchUserSetor(); // Busca o setor do usuário
    }
  }, [currentUser, navigate]);

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

  // Função para buscar o setor do usuário
  const fetchUserSetor = async () => {
    try {
      const userDocRef = doc(db, 'usernames', currentUser.uid); // Referência ao documento do usuário na coleção "usernames"
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserSetor(userData.setor || 'Setor não definido'); // Define o setor ou um valor padrão
      } else {
        setUserSetor('Setor não definido'); // Caso o documento não exista
      }
    } catch (error) {
      console.error('Erro ao buscar o setor do usuário:', error);
      enqueueSnackbar('Erro ao buscar o setor do usuário.', { variant: 'error' });
    }
  };

  // Função para formatar a data no fuso horário de São Paulo (GMT -3)
  const formatDateToSP = (dateString) => {
    return formatInTimeZone(new Date(dateString), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
  };

  const handleUpdateDisplayName = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      enqueueSnackbar('Nome de exibição atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar o nome de exibição.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (loading) return;

    if (newPassword !== confirmPassword) {
      enqueueSnackbar('As senhas não coincidem!', { variant: 'error' });
      return;
    }

    setLoading(true);
    setIsPasswordUpdating(true);

    try {
      // Reautentica o usuário
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Atualiza a senha
      await currentUser.updatePassword(newPassword);
      enqueueSnackbar('Senha atualizada com sucesso!', { variant: 'success' });
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
      {/* Sidebar */}
      <Sidebar />
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh', marginLeft: { xs: 0, md: 30 } }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5' }}>
          Meu Perfil
        </Typography>
        <Paper sx={{ p: 3, backgroundColor: '#fff', borderRadius: 2 }}>
          {/* Informações Gerais */}
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
            value={formatDateToSP(currentUser.metadata.creationTime)} // Formata para o fuso horário de SP
            margin="normal"
            disabled
            sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
          />
          <TextField
            fullWidth
            label="Último Login"
            value={formatDateToSP(currentUser.metadata.lastSignInTime)} // Formata para o fuso horário de SP
            margin="normal"
            disabled
            sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateDisplayName}
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

          {/* Quantidade de Chamados Atendidos */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#E8EAF6', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#283593' }}>
              Chamados Atendidos
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#283593' }}>
              {attendedCount}
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />

          {/* Alteração de Senha */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6A1B9A', mb: 2 }}>
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
            onClick={handleUpdatePassword}
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