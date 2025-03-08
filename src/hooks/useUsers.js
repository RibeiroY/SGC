import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, reload } from "firebase/auth";
import { auth } from "../firebase/firebase";

export const useUsers = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);  // Armazena os usuários
    const [loading, setLoading] = useState(true);
    const [userSetor, setUserSetor] = useState(""); // Estado para armazenar o setor do usuário logado
    const [displayName, setDisplayName] = useState(""); // Estado para o nome exibido
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

        // Inscrição em tempo real usando onSnapshot para pegar os dados dos usuários
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

        // Busca o setor e displayName do usuário logado com base no e-mail
        const fetchUserSetorAndDisplayName = async () => {
            try {
                const userQuery = query(collection(db, "usernames"), where("email", "==", currentUser.email));
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();
                    setUserSetor(userData.setor || "Setor não definido");
                    setDisplayName(userData.displayName || "Nome não definido"); // Atualiza o displayName com a versão do Firestore
                } else {
                    setUserSetor("Setor não definido");
                    setDisplayName("Nome não definido");
                }
            } catch (error) {
                console.error("Erro ao buscar o setor e displayName do usuário:", error);
            }
        };

        fetchUserSetorAndDisplayName();

        // Cleanup: cancela a inscrição ao desmontar o componente
        return () => unsubscribe();
    }, [currentUser, navigate]);

    // Atualiza o displayName em tempo real
    useEffect(() => {
        if (!currentUser?.email) return;

        const unsubscribe = onSnapshot(collection(db, "usernames"), (snapshot) => {
            snapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.email === currentUser.email) {
                    setDisplayName(data.displayName || "Nome não definido"); // Atualiza displayName em tempo real
                }
            });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const toggleUserActive = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "usernames", userId);
            await updateDoc(userRef, { isActive: !currentStatus });
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

    const handleUpdateDisplayName = async (newDisplayName) => {
        try {
            // Atualiza o nome de exibição no Firebase Authentication
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName,
            });

            // Atualiza o nome de exibição na coleção 'usernames'
            const userQuery = query(collection(db, "usernames"), where("email", "==", currentUser.email));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userRef = doc(db, "usernames", userSnapshot.docs[0].id);
                await updateDoc(userRef, { displayName: newDisplayName });
            }

            // Atualiza o estado em tempo real
            setDisplayName(newDisplayName);
        } catch (error) {
            console.error("Erro ao atualizar o nome de exibição:", error);
        }
    };

    const handleUpdatePassword = async (currentPassword, newPassword) => {
        try {
            // Verifica se o currentUser está autenticado
            if (!currentUser) {
                console.error("Usuário não autenticado");
                enqueueSnackbar('Você precisa estar autenticado para alterar a senha.', { variant: 'error' });
                return;
            }
    
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    
            // Reautentica o usuário com a senha atual
            await reauthenticateWithCredential(auth.currentUser, credential);
            console.log("Reautenticação bem-sucedida.");
    
            // Atualiza a senha usando o método correto para Firebase v9+
            await updatePassword(auth.currentUser, newPassword);
    
            // Recarrega os dados do usuário para refletir a alteração
            await reload(auth.currentUser);
            console.log("Senha atualizada com sucesso!");
    
            enqueueSnackbar('Senha atualizada com sucesso!', { variant: 'success' });
    
        } catch (error) {
            console.error("Erro ao atualizar a senha:", error);
    
            // Exibe a mensagem de erro
            enqueueSnackbar(`Erro ao atualizar a senha: ${error.message || error.code}`, { variant: 'error' });
        }
    };

    return {
        users,
        loading,
        userSetor,
        displayName,  // Agora fornecendo o displayName em tempo real
        toggleUserActive,
        updateUserRole,
        updateUserSetor,
        handleUpdateDisplayName,
        handleUpdatePassword,
    };
};
