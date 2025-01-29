import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Switch,
  useMediaQuery,
  Card,
  Select,
  MenuItem,
  TableContainer,
  Avatar ,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkIcon from "@mui/icons-material/Work";
import { useTheme, styled } from '@mui/material/styles';
import Sidebar from '../shared/Sidebar';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    console.log("🔄 Verificando currentUser...", currentUser);

    if (currentUser === undefined) return; // Aguarda currentUser carregar

    if (!currentUser) {
        console.log("⛔ Redirecionando para login...");
        navigate('/login');
        return;
    }

    if (!currentUser.role) {
        console.log("⚠️ currentUser não tem role ainda, aguardando...");
        return; // Aguarda o role carregar
    }

    if (currentUser.role !== "admin") {
        console.log("⛔ Usuário sem permissão, redirecionando...");
        navigate('/');
        return;
    }

    console.log("✅ Usuário é admin, buscando usuários...");
    fetchUsers();
}, [currentUser, navigate]);

const fetchUsers = async () => {
  try {
      console.log("📡 Buscando usuários...");
      const querySnapshot = await getDocs(collection(db, 'usernames'));
      
      if (querySnapshot.empty) {
          console.warn("⚠️ Nenhum usuário encontrado!");
      }

      let usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString() || 'N/A',
          lastLogin: doc.data().lastLogin?.toDate().toLocaleString() || 'N/A',
      }));

      console.log("🔄 Usuários carregados:", usersData);
      setUsers(usersData);
  } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
  } finally {
      console.log("⏳ Finalizando carregamento...");
      setLoading(false);
  }
};

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'usernames', userId);
      await updateDoc(userRef, { isActive: !currentStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, isActive: !currentStatus } : user))
      );
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'usernames', userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const CustomSwitch = styled(Switch)(({ checked }) => ({
    "& .MuiSwitch-thumb": {
      backgroundColor: checked ? "#bf27e6" : "#c6b7c9", // Cor do botão
    },
    "& .MuiSwitch-track": {
      backgroundColor: checked ? "#e39cf2" : "#d1c4d6", // Cor da trilha com tons um pouco mais suaves
    },
    "& .Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#bf27e6", // Cor da trilha quando está ativado
    },
  }));

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

  // 🔍 Verificação correta para evitar bloqueio na renderização
  if (!currentUser) {
    return (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h6">Verificando autenticação...</Typography>
        </Box>
    );
  }
  

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Adicionando log antes do Sidebar */}
      {console.log("📌 Renderizando Sidebar...")}
      <Sidebar />

      {/* Conteúdo principal */}
      <Box sx={{ flex: 1, padding: 3, backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
        {console.log("📌 Renderizando tela...")}
        
        <Typography variant="h4" gutterBottom>
          Gerenciar Usuários
        </Typography>

        <TextField
          label="Buscar por username ou e-mail"
          variant="outlined"
          fullWidth
          margin="normal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Adicionando log para verificar se filteredUsers está carregado */}
        {console.log("🔎 filteredUsers:", filteredUsers)}

        {isMobile ? (
          // Exibição em cards para dispositivos móveis
          <Box>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    boxShadow: 3,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#FAFAFA",
                    borderLeft: `6px solid ${user.isActive ? "#4CAF50" : "#F44336"}`, // Barra lateral verde/vermelha
                    "&:hover": {
                      transform: "scale(1.02)",
                      transition: "0.2s ease-in-out",
                    },
                  }}
                >
                  {/* Avatar com inicial do nome */}
                  <Avatar sx={{ bgcolor: "#6A1B9A", width: 50, height: 50 }}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>

                  {/* Conteúdo do card */}
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Nome */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4A148C" }}>
                      {user.displayName || "N/A"}
                    </Typography>

                    {/* Username */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountCircleIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
                      <Typography variant="body2" color="textSecondary">
                        {user.username || "N/A"}
                      </Typography>
                    </Box>

                    {/* Email */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
                      <Typography variant="body2" color="textSecondary">
                        {user.email || "N/A"}
                      </Typography>
                    </Box>

                    {/* Role (Função) */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WorkIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
                      <Select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        disabled={user.email === auth.currentUser?.email}
                        fullWidth
                        size="small"
                        sx={{
                          backgroundColor: "#fff",
                          borderRadius: 2,
                          mt: 1,
                        }}
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="technician">Technician</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </Box>
                  </Box>

                  {/* Status Ativo/Inativo */}
                  <Box>
                    <CustomSwitch
                      checked={user.isActive ?? true}
                      onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
                      disabled={user.email === auth.currentUser?.email}
                    />
                  </Box>
                </Card>
              ))
            ) : (
              <Typography align="center">Nenhum usuário encontrado.</Typography>
            )}
          </Box>
        ) : (
          // Exibição em tabela para desktops
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
            {console.log("📌 Renderizando tabela de usuários...")}

            <Table>
              <TableHead sx={{ backgroundColor: '#6A1B9A' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data de Criação</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Último Login</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Função</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ativo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id} sx={{ backgroundColor: index % 2 === 0 ? '#f4f0f5' : '#D1C4E9' }}>
                      <TableCell>{user.displayName || 'N/A'}</TableCell>
                      <TableCell>{user.username || 'N/A'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={user.email === auth.currentUser?.email}
                        >
                          <MenuItem value="user">Usuário</MenuItem>
                          <MenuItem value="technician">Técnico</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <CustomSwitch
                          checked={user.isActive ?? true}
                          onChange={() => toggleUserActive(user.id, user.isActive ?? true)}
                          disabled={user.email === auth.currentUser?.email}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
);
};

export default Users;
