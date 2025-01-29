import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, updateDoc, getDocs, serverTimestamp, collection } from "firebase/firestore";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("✅ Usuário autenticado:", user.email);

            // 🔍 Busca o username no Firestore
            const usersRef = collection(db, "usernames");
            const querySnapshot = await getDocs(usersRef);
            let foundUsername = null;

            querySnapshot.forEach((doc) => {
                if (doc.data().email === user.email) {
                    foundUsername = doc.id;
                }
            });

            if (!foundUsername) {
                console.error("❌ Username não encontrado para:", user.email);
                setLoading(false);
                return;
            }

            console.log("✅ Username encontrado:", foundUsername);

            // 🔄 Atualiza `lastLogin` no Firestore
            await updateDoc(doc(db, "usernames", foundUsername), {
                lastLogin: serverTimestamp(),
            });

            console.log("✅ Último login atualizado:", new Date().toLocaleString());

            // Exibe mensagem de sucesso
            toast.success("Login bem-sucedido!", { position: "top-center", autoClose: 2000 });

            // Redireciona após 2 segundos
            setTimeout(() => navigate("/home"), 2000);
        } catch (err) {
            console.error("❌ Erro ao fazer login:", err);
            setError("Erro ao fazer login. Verifique os dados e tente novamente.");
            setLoading(false);
        }
    };

    return { handleLogin, loading, error };
};
