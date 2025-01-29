import React, { useState } from 'react';
import { TextField, Button, Typography, Alert, Box, Link } from '@mui/material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase'; // Firestore
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
  
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique.');
      return;
    }
  
    if (!username) {
      setError('O campo "username" é obrigatório.');
      return;
    }
  
    try {
      // Verifica se o username já existe no Firestore
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        setError('Este username já está em uso. Por favor, escolha outro.');
        return;
      }
  
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Atualiza o displayName do usuário no Firebase Auth
      await updateProfile(user, {
        displayName: name,
      });
  
      // Salva os dados do usuário no Firestore usando o USERNAME como ID do documento
      await setDoc(doc(db, 'usernames', username), {
        uid: user.uid,
        username: username,
        displayName: name,
        email: email,
        role: 'user', // Define a role padrão como "user"
        createdAt: serverTimestamp(), // Data de criação
        isActive: false, // Usuário começa como inativo
      });
  
      // Desloga o usuário após o registro
      auth.signOut();
  
      setSuccess('Cadastro realizado com sucesso! Você já pode fazer login.');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este e-mail já está cadastrado. Por favor, utilize outro e-mail.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        case 'auth/invalid-email':
          setError('E-mail inválido. Verifique o formato e tente novamente.');
          break;
        default:
          setError('Erro ao registrar. Verifique os dados e tente novamente.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#2B1432',
        padding: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          display: 'grid',
          gap: 2,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Registro
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <form onSubmit={handleRegister}>
          <TextField
            label="Nome Completo"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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

          <TextField
            label="Confirmar Senha"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Registrar
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Já tem uma conta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ color: '#F96822', textDecoration: 'none' }}
            >
              Faça login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
