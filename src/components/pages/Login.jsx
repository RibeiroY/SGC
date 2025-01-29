import React, { useEffect } from "react";
import { Grid2 } from "@mui/material"; // ✅ Importando Grid2
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLogin } from "../../hooks/useLogin";
import LoginForm from "../../components/LoginForm";
import AuthLoader from "../../components/AuthLoader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const { userLoggedIn } = useAuth();
    const { handleLogin, loading, error } = useLogin();
    const navigate = useNavigate();

    useEffect(() => {
        if (userLoggedIn) {
            navigate("/home");
        }
    }, [userLoggedIn, navigate]);

    if (loading) {
        return <AuthLoader message="Autenticando..." />;
    }

    return (
        <Grid2
            container
            sx={{
                minHeight: "100vh",
                backgroundColor: "#2B1432",
                padding: 2,
                display: "grid",
                placeItems: "center",
            }}
        >
            <Grid2
                xs={12}
                sm={8}
                md={4}
                sx={{
                    backgroundColor: "#fff",
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: "grid",
                    gap: 2,
                }}
            >
                <LoginForm onSubmit={handleLogin} error={error} />
            </Grid2>

            <ToastContainer />
        </Grid2>
    );
};

export default Login;
