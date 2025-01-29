import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] Configurando listener de autenticação...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("[AuthContext] Estado de autenticação mudou:", user);
        await initializeUser(user);
      } catch (error) {
        console.error("[AuthContext] Erro ao inicializar usuário:", error);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (!user) {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      const uid = user.uid;
      console.log("[AuthContext] UID do usuário:", uid);

      // 🔍 Busca o usuário no Firestore pelo UID
      const q = query(collection(db, "usernames"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("[AuthContext] Dados do usuário encontrados:", userData);

        setCurrentUser({
          ...user,
          admin: userData.admin,
          isActive: userData.isActive,
          role: userData.role || "user", // 🔥 Garante que a role está correta
        });
      } else {
        setCurrentUser({ ...user, role: "user" }); // 🔥 Se não tiver role, assume "user"
      }

      setUserLoggedIn(true);
    } catch (error) {
      console.error("[AuthContext] Erro ao buscar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    userLoggedIn,
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
