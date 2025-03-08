import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export function useRegister() {
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
      const usernameDoc = await getDoc(doc(db, "usernames", username));
      if (usernameDoc.exists()) {
        setError("Este username já está em uso. Por favor, escolha outro.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "usernames", username), {
        uid: user.uid, // Armazenar o UID do Firebase Authentication
        username,
        displayName: name,
        email,
        role: "user",
        createdAt: serverTimestamp(),
        isActive: false,
        setor: null,
      });

      // Enviar notificação para admins
      const notificationMessage = `Um novo usuário foi registrado: ${username}`;
      const notificationRef = collection(db, 'notifications');
      const usersRef = collection(db, 'usernames');
      const usersQuery = query(usersRef, where('role', '==', 'admin'));
      const usersSnapshot = await getDocs(usersQuery);

      usersSnapshot.forEach(async (userDoc) => {
        await addDoc(notificationRef, {
          userId: userDoc.data().uid, // Usar o UID do admin
          message: notificationMessage,
          timestamp: new Date(),
          read: false,
        });
      });

      await auth.signOut();

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError("Erro ao registrar. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error, success };
}