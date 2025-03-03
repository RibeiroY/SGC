import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline } from '@mui/material';
import Routes from "./routes"; // Caminho corrigido
import { SnackbarProvider } from 'notistack';

const App = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <CssBaseline />
        <Routes />
      </Router>
    </SnackbarProvider>
  );
};

export default App;
