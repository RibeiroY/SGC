import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export function useRegister() { // 🔍 Certifique-se de estar exportando corretamente
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (name, username, email, password, confirmPassword) => {
        setError("");
        setSuccess("");

        if (!name || !username || !email || !password || !confirmPassword) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem. Por favor, verifique.");
            return;
        }

        setLoading(true);
        try {
            // 🔍 Verifica se o username já existe no Firestore
            const usernameDoc = await getDoc(doc(db, "usernames", username));
            if (usernameDoc.exists()) {
                setError("Este username já está em uso. Por favor, escolha outro.");
                setLoading(false);
                return;
            }

            // 🔄 Criação do usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 🔄 Atualiza o displayName do usuário
            await updateProfile(user, { displayName: name });

            // 🔄 Salva os dados no Firestore
            await setDoc(doc(db, "usernames", username), {
                uid: user.uid,
                username,
                displayName: name,
                email,
                role: "user", // Usuário inicia como "user"
                createdAt: serverTimestamp(),
                isActive: false, // Começa como inativo
                setor: null, //Setor do usuário, inicialmente atribuído como null
            });

            // 🔴 **Evita deslogar automaticamente após o registro**
            // auth.signOut();  (🔥 Removido para evitar UX ruim)

            setSuccess("Cadastro realizado com sucesso! Redirecionando...");

            // ⏳ Redireciona para login após 2 segundos
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            console.error("❌ Erro ao registrar:", err);

            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Este e-mail já está cadastrado. Por favor, utilize outro.");
                    break;
                case "auth/weak-password":
                    setError("A senha deve ter pelo menos 6 caracteres.");
                    break;
                case "auth/invalid-email":
                    setError("E-mail inválido. Verifique o formato.");
                    break;
                default:
                    setError("Erro ao registrar. Verifique os dados e tente novamente.");
            }
        }
        setLoading(false);
    };

    return { handleRegister, loading, error, success };
}
