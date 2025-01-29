import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const useRedirectIfNotLoggedIn = () => {
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userLoggedIn) {
            navigate("/login");
        }
    }, [userLoggedIn, navigate]);
};

export default useRedirectIfNotLoggedIn;
