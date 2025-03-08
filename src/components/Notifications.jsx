import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Drawer, Badge, Button, Avatar, ListItemAvatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { db } from '../firebase/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.uid) {
      console.log("Usuário não autenticado ou UID indefinido.");
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {  // Marcando a função como 'async' para permitir o uso de 'await'
        const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notificationsData);
      },
      (error) => {
        console.error("Erro ao buscar notificações:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  };

  const deleteNotification = async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  };

  return (
    <>
      <IconButton color="inherit" onClick={toggleDrawer(true)}>
        <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 350, padding: 2, backgroundColor: '#f5f5f5', height: '100vh' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2B1432' }}>
            Notificações
          </Typography>
          <List>
            {notifications.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                Nenhuma notificação disponível.
              </Typography>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    backgroundColor: '#fff',
                    mb: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? '#6A1B9A' : '#4CAF50' }}>
                      {notification.message[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: notification.read ? 'normal' : 'bold', color: '#2B1432' }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {new Date(notification.timestamp?.toDate()).toLocaleString()}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        sx={{
                          color: '#fff',
                          backgroundColor: '#4CAF50',
                          '&:hover': { backgroundColor: '#43A047' },
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                        }}
                      >
                        Marcar como lida
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteNotification(notification.id)}
                      sx={{
                        color: '#fff',
                        backgroundColor: '#F44336',
                        '&:hover': { backgroundColor: '#D32F2F' },
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                      }}
                    >
                      Excluir
                    </Button>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Notifications;
