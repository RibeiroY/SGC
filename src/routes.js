import React from "react";
import { useRoutes } from "react-router-dom";
import Login from "./components/pages/Login";
import Users from "./components/pages/Users";
import Register from "./components/pages/Register";
import Home from "./components/pages/Home";
import Equipments from "./components/pages/Equipments";
import Chamados from "./components/pages/Chamados";
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
    }
    /*{
      path: "/profile",
      element: <UserProfile />
    }*/
  ];
  return useRoutes(routesArray);
};


export default Routes;
