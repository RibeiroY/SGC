import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Menu,
  Home,
  Person,
  Settings,
  Logout,
  Dashboard,
  ListAlt,
  Build,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Notifications from './../Notifications'; // Importe o componente de notificações

const Sidebar = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userLoggedIn } = useAuth();

  if (!userLoggedIn) {
    return null; // Se o usuário não estiver logado, não renderiza a Sidebar
  }

  const userRole = currentUser?.role || 'user';

  const handleLogout = async () => {
    try {
      setDrawerOpen(false); // Fecha o Drawer
      await auth.signOut();
      setTimeout(() => {
        navigate('/login');
      }, 0);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  // Botões da sidebar
  const buttons = [
    { label: 'Início', icon: <Home />, path: '/' },
    userRole === 'admin' && { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard', hideMobile: true },
    { label: 'Chamados', icon: <ListAlt />, path: '/Chamados' },
    (userRole === 'admin' || userRole === 'technician') && { label: 'Equipamentos', icon: <Build />, path: '/equipments' },
    userRole === 'admin' && { label: 'Usuários', icon: <People />, path: '/users' },
    { label: 'Perfil', icon: <Person />, path: '/profile' },
    
  ].filter(Boolean);

  return (
    <>
      {/* Header Bar para dispositivos móveis */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' }, // Exibe apenas em dispositivos móveis
          backgroundColor: '#2B1432',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Gerenciamento de TI
          </Typography>
          {/* Ícone de notificações com indicador de novas notificações */}
          <Notifications />
        </Toolbar>
      </AppBar>

      {/* Drawer (menu lateral para telas menores) */}
      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 250,
            height: '100vh',
            backgroundColor: '#2B1432',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            Gerenciamento de TI
          </Typography>
          {buttons.map((button, index) => (
            <Button
              key={`${button.label}-${index}`} // Garantindo uma chave única usando o índice
              variant="text"
              startIcon={button.icon}
              onClick={() => {
                navigate(button.path);
                setDrawerOpen(false);
              }}
              sx={{
                color: '#fff',
                width: '90%',
                justifyContent: 'flex-start',
                display: button.hideMobile ? { xs: 'none', md: 'flex' } : 'flex',
                '&:hover': { backgroundColor: '#3A1E4B' },
              }}
            >
              {button.label}
            </Button>
          ))}
          <Button
            variant="text"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              color: '#fff',
              width: '90%',
              justifyContent: 'flex-start',
              marginTop: 'auto',
              '&:hover': { backgroundColor: '#3A1E4B' },
            }}
          >
            Sair
          </Button>
        </Box>
      </Drawer>

      {/* Sidebar (menu fixo para telas maiores) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 250,
          height: '100vh',
          backgroundColor: '#2B1432',
          color: '#fff',
          display: { xs: 'none', md: 'flex' }, // Oculta a sidebar em telas pequenas
          flexDirection: 'column',
          paddingTop: 2,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
          Gerenciamento de TI
          <Notifications />
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {buttons.map((button, index) => (
            <Button
              key={`${button.label}-${index}`} // Garantindo uma chave única usando o índice
              variant="text"
              startIcon={button.icon}
              onClick={() => navigate(button.path)}
              sx={{
                color: '#fff',
                width: '90%',
                justifyContent: 'flex-start',
                '&:hover': { backgroundColor: '#3A1E4B' },
              }}
            >
              {button.label}
            </Button>
          ))}
        </Box>
        <Button
          variant="text"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: '#fff',
            width: '90%',
            justifyContent: 'flex-start',
            marginLeft: 1.5,
            marginBottom: 2,
            '&:hover': { backgroundColor: '#3A1E4B' },
          }}
        >
          Sair
        </Button>
      </Box>
    </>
  );
};

export default Sidebar;
