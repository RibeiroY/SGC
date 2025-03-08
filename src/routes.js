import React from "react";
import { useRoutes } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Equipments from "./pages/Equipments";
import Chamados from "./pages/Chamados";
import ChamadoDetalhes from "./pages/ChamadoDetalhes";
import Dashboard from "./pages/Dashboard";
import EquipamentoDetalhes from "./pages/EquipamentoDetalhes";
import UserDetalhes from "./pages/UserDetalhes";
import UserProfile from "./pages/UserProfile";
//import UserProfile from "./components/UserProfile";


const Routes = () => {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/users",
      element: <Users/>,
    },
    {
      path: "/equipments",
      element: <Equipments/>,
    },
    {
      path: "/chamados",
      element: <Chamados />,
    },
    {
      path: "/chamados/:id", // Rota para a página de detalhes do chamado
      element: <ChamadoDetalhes />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/equipamentos/:id", // Rota para a página de detalhes do equipamento
      element: <EquipamentoDetalhes />,
    },
    {
      path: "/users/:id",
      element: <UserDetalhes />
    },
    {
      path: "/profile",
      element: <UserProfile />
    }
  ];
  return useRoutes(routesArray);
};


export default Routes;
