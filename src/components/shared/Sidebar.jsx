import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Drawer, Tooltip } from '@mui/material';
import { Menu, Home, Person, Settings, Logout, Dashboard, ListAlt, Build, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Sidebar = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [userUid, setUserUid] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Usuário autenticado:', user.uid);
        setUserUid(user.uid);
      } else {
        console.warn('Nenhum usuário autenticado.');
        setUserUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userUid) return;
      console.log('Buscando role para UID:', userUid);
      try {
        const usernamesCollection = collection(db, 'usernames');
        const userQuerySnapshot = await getDocs(usernamesCollection);

        let roleEncontrada = 'user';

        userQuerySnapshot.forEach((doc) => {
          if (doc.data().uid === userUid) {
            roleEncontrada = doc.data().role || 'user';
            console.log('Role encontrada no Firestore:', roleEncontrada);
          }
        });

        setUserRole(roleEncontrada);
      } catch (error) {
        console.error('Erro ao buscar role do usuário:', error);
      }
    };

    if (userUid) {
      fetchUserRole();
    }
  }, [userUid]);

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

  const buttons = [
    { label: 'Início', icon: <Home />, path: '/' },
    userRole === 'admin' && { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard', hideMobile: true },
    { label: 'Chamados', icon: <ListAlt />, path: '/chamados' },
    (userRole === 'admin' || userRole === 'technician') && { label: 'Equipamentos', icon: <Build />, path: '/equipamentos' },
    userRole === 'admin' && { label: 'Usuários', icon: <People />, path: '/users' },
    { label: 'Perfil', icon: <Person />, path: '/profile' },
    { label: 'Configurações', icon: <Settings />, path: '/settings' },
  ].filter(Boolean);

  return (
    <>
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
          {buttons.map(({ label, icon, path, action, hideMobile }) => (
            <Button
              key={label}
              variant="text"
              startIcon={icon}
              onClick={() => {
                if (action) action();
                else navigate(path);
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
          {buttons.map(({ label, icon, path, action, hideMobile }) => (
            <Button
              key={label}
              variant="text"
              startIcon={icon}
              onClick={() => {
                if (action) action();
                else navigate(path);
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
        {buttons.map(({ label, icon, path, action, hideMobile }) => (
          !hideMobile && (
            <Tooltip title={label} placement="right" key={label}>
              <IconButton
                sx={{
                  color: '#fff',
                  marginBottom: 2,
                  '&:hover': { backgroundColor: '#3A1E4B' },
                }}
                onClick={() => {
                  if (action) action();
                  else navigate(path);
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          )
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
