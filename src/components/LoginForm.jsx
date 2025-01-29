import React, { useState } from "react";
import { TextField, Button, Box, Alert, Typography, Link } from "@mui/material";

const LoginForm = ({ onSubmit, error }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(email, password);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* ✅ TÍTULO ADICIONADO */}
            <Typography variant="h5" align="center" gutterBottom>
                Acesse sua Conta
            </Typography>

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
                    backgroundColor: "#F96822",
                    "&:hover": { backgroundColor: "darkorange" },
                }}
                fullWidth
            >
                Entrar
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2">
                    Não tem uma conta?{" "}
                    <Link href="/register" sx={{ color: "#F96822", textDecoration: "none" }}>
                        Registre-se
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginForm;
