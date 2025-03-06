import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
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

        // Inscrição em tempo real usando onSnapshot
        const unsubscribe = onSnapshot(
            collection(db, "usernames"),
            (snapshot) => {
                const usersData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate().toLocaleString() || "N/A",
                    lastLogin: doc.data().lastLogin?.toDate().toLocaleString() || "N/A",
                }));
                setUsers(usersData);
                setLoading(false);
            },
            (error) => {
                console.error("❌ Erro ao buscar usuários:", error);
                setLoading(false);
            }
        );

        // Cleanup: cancela a inscrição ao desmontar o componente
        return () => unsubscribe();
    }, [currentUser, navigate]);

    const toggleUserActive = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { isActive: !currentStatus });
            // Não é necessário atualizar o estado local, pois o onSnapshot atualizará automaticamente
        } catch (error) {
            console.error("Erro ao atualizar status do usuário:", error);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { role: newRole });
        } catch (error) {
            console.error("Erro ao atualizar role do usuário:", error);
        }
    };

    const updateUserSetor = async (userId, newSetor) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { setor: newSetor });
        } catch (error) {
            console.error("Erro ao atualizar setor do usuário:", error);
        }
    };

    return { users, loading, toggleUserActive, updateUserRole, updateUserSetor };
};
