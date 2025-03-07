// components/shared/CustomSwitch.js
import React from "react";
import { Switch, styled } from "@mui/material";

// Estilo personalizado para o Switch
const CustomSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#4CAF50",
    "&:hover": {
      backgroundColor: "rgba(76, 175, 80, 0.08)",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#4CAF50",
  },
  "& .MuiSwitch-switchBase": {
    color: "#F44336",
    "&:hover": {
      backgroundColor: "rgba(244, 67, 54, 0.08)",
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#F44336",
  },
}));

export default CustomSwitch;
