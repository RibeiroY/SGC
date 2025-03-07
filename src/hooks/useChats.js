import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  getDoc,
  updateDoc,
  where,
  getDocs
} from 'firebase/firestore';

const useChat = (chamadoId, currentUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState({
    displayName: currentUser?.displayName,
    email: currentUser?.email
  });

  // Escuta as mensagens do chat em tempo real na subcoleção 'messages'
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chamadoId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chamadoId]);

  // Escuta mudanças no usuário (displayName, email)
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setCurrentUserInfo({
          displayName: userData.displayName || currentUser.displayName,
          email: userData.email || currentUser.email
        });

        // Atualiza mensagens antigas com o novo displayName e email
        const messagesRef = collection(db, 'chats', chamadoId, 'messages');
        const querySnapshot = await getDocs(query(messagesRef, where('senderId', '==', currentUser.uid)));
        
        querySnapshot.forEach((doc) => {
          updateDoc(doc.ref, {
            senderName: userData.displayName || currentUser.displayName,
            senderEmail: userData.email || currentUser.email
          });
        });
      }
    });

    return () => unsubscribeUser();
  }, [currentUser, chamadoId]);

  // Função para enviar uma nova mensagem
  const sendMessage = async (senderId, senderName, text) => {
    if (!text.trim()) return;

    const messagesRef = collection(db, 'chats', chamadoId, 'messages');
    const newMessage = {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
    };

    await addDoc(messagesRef, newMessage);
  };

  return { messages, loading, sendMessage, currentUserInfo };
};

export default useChat;
