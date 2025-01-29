import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import Sidebar from '../shared/Sidebar';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkUserStatus(currentUser);
      } else {
        navigate('/login'); // Redireciona se não estiver autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUserStatus = async (currentUser) => {
    try {
      // Busca o usuário no Firestore baseado no email (pois username é ID no Firestore)
      const q = query(collection(db, 'usernames'), where('email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); // Pega o primeiro usuário encontrado
        setIsActive(userData.isActive);
      } else {
        setIsActive(false); // Usuário não encontrado no Firestore
      }
    } catch (error) {
      console.error('Erro ao buscar status do usuário:', error);
      setIsActive(false); // Assume inativo em caso de erro
    } finally {
      setLoading(false); // Finaliza o estado de carregamento
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#2B1432',
          color: '#fff',
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Carregando...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null; // Usuário não autenticado, navegado para login
  }

  if (isActive === false) {
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
          onClick={handleLogout}
        >
          Sair
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
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
          Olá, você é {user.displayName || 'Usuário'}!
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;