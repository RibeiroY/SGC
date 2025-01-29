import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const AuthLoader = ({ message }) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#2B1432",
                color: "#fff",
                flexDirection: "column",
            }}
        >
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 2 }}>{message}</Typography>
        </Box>
    );
};

export default AuthLoader;
