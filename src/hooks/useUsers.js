import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useUsers = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser === undefined) return;

        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (!currentUser.role) return;

        if (currentUser.role !== "admin") {
            navigate("/");
            return;
        }

        fetchUsers();
    }, [currentUser, navigate]);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "usernames"));
            const usersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleString() || "N/A",
                lastLogin: doc.data().lastLogin?.toDate().toLocaleString() || "N/A",
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("❌ Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserActive = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { isActive: !currentStatus });
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, isActive: !currentStatus } : user
                )
            );
        } catch (error) {
            console.error("Erro ao atualizar status do usuário:", error);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { role: newRole });
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error("Erro ao atualizar role do usuário:", error);
        }
    };

    return { users, loading, toggleUserActive, updateUserRole };
};
