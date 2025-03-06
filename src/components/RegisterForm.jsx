import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Link, CircularProgress } from "@mui/material";
import { useSnackbar } from 'notistack';

const RegisterForm = ({ onSubmit, error, success, loading }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    // Efeito para exibir notificações de erro ou sucesso
    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
        }
        if (success) {
            enqueueSnackbar(success, { variant: 'success' });
        }
    }, [error, success, enqueueSnackbar]);

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(name, username, email, password, confirmPassword);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" align="center" gutterBottom>
                Criar Conta
            </Typography>

            <TextField 
                label="Nome Completo" 
                fullWidth 
                margin="normal" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            <TextField 
                label="Username" 
                fullWidth 
                margin="normal" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <TextField 
                label="E-mail" 
                fullWidth 
                margin="normal" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <TextField 
                label="Senha" 
                type="password" 
                fullWidth 
                margin="normal" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <TextField 
                label="Confirmar Senha" 
                type="password" 
                fullWidth 
                margin="normal" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
            />

            <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={loading}
                sx={{ 
                    mt: 2, 
                    backgroundColor: "#F96822", 
                    "&:hover": { backgroundColor: "darkorange" } 
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Registrar"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2">
                    Já tem uma conta?{" "}
                    <Link href="/login" sx={{ color: "#F96822", textDecoration: "none" }}>
                        Faça login
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default RegisterForm;
