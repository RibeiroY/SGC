import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline } from '@mui/material';
import Routes from "./routes"; // Caminho corrigido

const App = () => {
  return (
    <Router>
      <CssBaseline />
      <Routes />
    </Router>
  );
};

export default App;
