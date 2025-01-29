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
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] Setting up auth state change listener"); // Log de depuração
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log("[AuthContext] Auth state changed:", user); // Log de depuração
        await initializeUser(user);
      } catch (error) {
        console.error("[AuthContext] Error during auth state change:", error);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    try {
      if (user) {
        const uid = user.uid;
        console.log("[AuthContext] User UID:", uid); // Log de depuração

        // Consulta ao Firestore para buscar dados adicionais
        const q = query(collection(db, "usernames"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            setCurrentUser({ ...user, admin: userData.admin });
          });
        } else {
          setCurrentUser(user);
        }

        // Verifica se o usuário usa e-mail/senha
        const isEmail = user.providerData.some(
          (provider) => provider.providerId === "password"
        );
        setIsEmailUser(isEmail);

        setUserLoggedIn(true);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error("[AuthContext] Error initializing user:", error); // Log de erro
    } finally {
      setLoading(false); // Garante que o estado de loading seja atualizado
    }
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
