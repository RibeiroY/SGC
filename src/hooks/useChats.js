import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

const useChat = (chamadoId) => {
    const [messages, setMessages] = useState([]); // Estado para armazenar as mensagens
    const [loading, setLoading] = useState(true); // Estado para indicar se está carregando

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

    // Função para enviar uma nova mensagem
    const sendMessage = async (senderId, senderName, text) => {
        if (!text.trim()) return;

        const messagesRef = collection(db, 'chats', chamadoId, 'messages');
        const newMessage = {
            senderId,
            senderName,
            text,
            timestamp: serverTimestamp(), // Armazena o horário do servidor
        };

        await addDoc(messagesRef, newMessage);
    };

    return { messages, loading, sendMessage };
};

export default useChat;
