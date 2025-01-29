import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import Sidebar from '../shared/Sidebar';
import { auth } from '../../firebase/firebase';

const Home = () => {
  const { currentUser, userLoggedIn } = useAuth(); // Obtém o usuário do contexto
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/login'); // Redireciona se não estiver autenticado
    }
  }, [userLoggedIn, navigate]);

  if (!userLoggedIn) {
    return null;
  }

  if (currentUser?.isActive === false) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#2B1432',
          color: '#fff',
          textAlign: 'center',
          padding: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Você deve ser ativado por um ADM antes de acessar nosso serviço.
        </Typography>
        <Typography variant="body1">
          Entre em contato com um administrador para ativar sua conta.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3, backgroundColor: '#FFA500', color: '#fff', '&:hover': { backgroundColor: '#FF8C00' } }}
          onClick={async () => {
            await auth.signOut();
            navigate('/login');
          }}
        >
          Sair
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          padding: 3,
          backgroundColor: 'rgba(104, 100, 100, 0.5)',
          color: 'black',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Olá, {currentUser?.displayName || 'Usuário'}!
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
