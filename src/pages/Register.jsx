import React from "react";
import { Box } from "@mui/material";
import { useRegister } from "../hooks/useRegister";
import RegisterForm from "../components/RegisterForm"; // Novo componente

const Register = () => {
    const { handleRegister, error, success, loading } = useRegister();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#2B1432",
                padding: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#fff",
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: "grid",
                    gap: 2,
                    width: "100%",
                    maxWidth: "400px",
                }}
            >
                <RegisterForm onSubmit={handleRegister} error={error} success={success} loading={loading} />
            </Box>
        </Box>
    );
};

export default Register;
