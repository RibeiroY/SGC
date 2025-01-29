import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, Grid, Link, CircularProgress } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { doc, updateDoc, getDocs, serverTimestamp, collection } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext'; // Importa o contexto de autenticação
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const { userLoggedIn } = useAuth(); // Obtém estado do contexto
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoggedIn) {
      navigate('/home'); // Se já estiver logado, redireciona
    }
  }, [userLoggedIn, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true); // Inicia o loading

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ Usuário autenticado:", user.email);

      // 🔍 Busca o username no Firestore
      const usersRef = collection(db, "usernames");
      const querySnapshot = await getDocs(usersRef);
      let foundUsername = null;

      querySnapshot.forEach((doc) => {
        if (doc.data().email === user.email) {
          foundUsername = doc.id;
        }
      });

      if (!foundUsername) {
        console.error("❌ Username não encontrado no Firestore para email:", user.email);
        setLoading(false);
        return;
      }

      console.log("✅ Username correto encontrado:", foundUsername);

      // 🔄 Atualiza `lastLogin` no Firestore
      const userRef = doc(db, 'usernames', foundUsername);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });

      console.log('✅ Último login atualizado:', new Date().toLocaleString());

      // Exibe mensagem de sucesso
      toast.success('Login bem-sucedido!', {
        position: 'top-center',
        autoClose: 2000,
      });

      // Aguarda 2s e redireciona para Home
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('❌ Erro ao fazer login:', err);
      setError('Erro ao fazer login. Verifique os dados e tente novamente.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#2B1432',
          color: '#fff',
          flexDirection: 'column',
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Autenticando...</Typography>
      </Box>
    );
  }

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        backgroundColor: '#2B1432',
        padding: 2,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Grid
        xs={12}
        sm={8}
        md={4}
        sx={{
          backgroundColor: '#fff',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          display: 'grid',
          gap: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#F96822',
              '&:hover': {
                backgroundColor: 'darkorange',
              },
            }}
            fullWidth
          >
            Entrar
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Não tem uma conta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ color: '#F96822', textDecoration: 'none' }}
            >
              Registre-se
            </Link>
          </Typography>
        </Box>
      </Grid>

      <ToastContainer />
    </Grid>
  );
};

export default Login;
