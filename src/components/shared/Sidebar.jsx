import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Drawer, Tooltip } from '@mui/material';
import { Menu, Home, Person, Settings, Logout, Dashboard, ListAlt, Build, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Agora usa o contexto

const Sidebar = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userLoggedIn } = useAuth(); // ✅ Obtém o usuário autenticado

  if (!userLoggedIn) {
    return null; // Se o usuário não estiver logado, não renderiza a Sidebar
  }

  const userRole = currentUser?.role || 'user'; // ✅ Obtém a role do usuário do contexto

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  // ✅ Mantive a mesma lógica de permissionamento dos botões do seu código original
  const buttons = [
    { label: 'Início', icon: <Home />, path: '/' },
    userRole === 'admin' && { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard', hideMobile: true },
    { label: 'Chamados', icon: <ListAlt />, path: '/chamados' },
    (userRole === 'admin' || userRole === 'technician') && { label: 'Equipamentos', icon: <Build />, path: '/equipamentos' },
    userRole === 'admin' && { label: 'Usuários', icon: <People />, path: '/users' },
    { label: 'Perfil', icon: <Person />, path: '/profile' },
    { label: 'Configurações', icon: <Settings />, path: '/settings' },
  ].filter(Boolean); // ✅ Remove botões que não devem ser exibidos

  return (
    <>
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
          {buttons.map(({ label, icon, path, hideMobile }) => (
            <Button
              key={label}
              variant="text"
              startIcon={icon}
              onClick={() => {
                navigate(path);
                setDrawerOpen(false);
              }}
              sx={{
                color: '#fff',
                width: '90%',
                justifyContent: 'flex-start',
                display: hideMobile ? { xs: 'none', md: 'flex' } : 'flex',
                '&:hover': { backgroundColor: '#3A1E4B' },
              }}
            >
              {label}
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
          display: { xs: 'none', md: 'flex' },
          width: 250,
          height: '100vh',
          backgroundColor: '#2B1432',
          flexDirection: 'column',
          color: '#fff',
          paddingTop: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
          Gerenciamento de TI
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {buttons.map(({ label, icon, path }) => (
            <Button
              key={label}
              variant="text"
              startIcon={icon}
              onClick={() => navigate(path)}
              sx={{
                color: '#fff',
                width: '90%',
                justifyContent: 'flex-start',
                '&:hover': { backgroundColor: '#3A1E4B' },
              }}
            >
              {label}
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

      {/* Ícones no menu pequeno (mobile) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          width: 70,
          height: '100vh',
          backgroundColor: '#2B1432',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 2,
        }}
      >
        <Tooltip title="Menu" placement="right">
          <IconButton
            sx={{
              color: '#fff',
              marginBottom: 2,
              '&:hover': { backgroundColor: '#3A1E4B' },
            }}
            onClick={toggleDrawer}
          >
            <Menu />
          </IconButton>
        </Tooltip>
        {buttons.map(({ label, icon, path }) => (
          <Tooltip title={label} placement="right" key={label}>
            <IconButton
              sx={{
                color: '#fff',
                marginBottom: 2,
                '&:hover': { backgroundColor: '#3A1E4B' },
              }}
              onClick={() => navigate(path)}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title="Sair" placement="right">
          <IconButton
            sx={{
              color: '#fff',
              marginBottom: 2,
              '&:hover': { backgroundColor: '#3A1E4B' },
            }}
            onClick={handleLogout}
          >
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
};

export default Sidebar;
