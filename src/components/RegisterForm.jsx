import React, { useState } from "react";
import { TextField, Button, Alert, Box, Typography, Link } from "@mui/material";

const RegisterForm = ({ onSubmit, error, success }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(name, username, email, password, confirmPassword);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* ✅ TÍTULO DO FORMULÁRIO */}
            <Typography variant="h5" align="center" gutterBottom>
                Criar Conta
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField label="Nome Completo" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField label="E-mail" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Senha" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
            <TextField label="Confirmar Senha" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: "#F96822", "&:hover": { backgroundColor: "darkorange" } }} fullWidth>
                Registrar
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
