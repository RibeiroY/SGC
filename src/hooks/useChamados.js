import { useState, useEffect } from 'react';
import { db } from './../firebase/firebase';
import { collection, doc, setDoc, addDoc, runTransaction, query, orderBy, limit, getDocs, where, updateDoc, onSnapshot } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';

export const useChamados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuth();

  const getNextChamadoId = async () => {
    const counterRef = doc(db, 'counters', 'chamados_counter');
    try {
      const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let count = 0;

        if (!counterDoc.exists()) {
          const chamadosRef = collection(db, 'chamados');
          const chamadosQuery = query(chamadosRef, orderBy('chamadoId', 'desc'), limit(1));
          const querySnapshot = await getDocs(chamadosQuery);

          if (!querySnapshot.empty) {
            const lastChamadoId = querySnapshot.docs[0].id;
            count = parseInt(lastChamadoId, 10);
          } else {
            count = 0;
          }

          count = count + 1;
          transaction.set(counterRef, { count });
        } else {
          count = counterDoc.data().count + 1;
          transaction.update(counterRef, { count });
        }
        return count;
      });
      return String(newId).padStart(10, '0');
    } catch (error) {
      console.error("Falha ao obter o próximo ID do chamado: ", error);
      throw error;
    }
  };

  const addChamado = async (titulo, descricao, equipamento, tipo, username) => {
    setLoading(true);
    setError(null);

    try {
      const chamadoId = await getNextChamadoId();
      let setor = null;
      if (equipamento) {
        const equipamentosQuery = query(collection(db, 'equipamentos'), where('code', '==', equipamento.trim()));
        const equipamentosSnapshot = await getDocs(equipamentosQuery);
        if (!equipamentosSnapshot.empty) {
          const equipmentData = equipamentosSnapshot.docs[0].data();
          setor = equipmentData.setor || null;
        }
      }

      const chamadoRef = doc(db, 'chamados', chamadoId);
      await setDoc(chamadoRef, {
        titulo,
        descricao,
        equipamento,
        tipo,
        username,
        setor,
        prioridade: 'Média',
        status: 'Aberto',
        createdAt: new Date(),
      });

      // Enviar notificação para técnicos e admins
      const notificationMessage = `Um novo chamado foi aberto: ${chamadoId}`;
      const notificationRef = collection(db, 'notifications');
      const usersRef = collection(db, 'usernames');
      const usersQuery = query(usersRef, where('role', 'in', ['admin', 'technician']));
      const usersSnapshot = await getDocs(usersQuery);

      usersSnapshot.forEach(async (userDoc) => {
        await addDoc(notificationRef, {
          userId: userDoc.data().uid, // Usar o UID do admin/técnico
          message: notificationMessage,
          timestamp: new Date(),
          read: false,
        });
      });

      enqueueSnackbar('Chamado adicionado com sucesso!', { variant: 'success' });
    } catch (err) {
      console.error('Erro ao adicionar chamado:', err);
      setError(err.message);
      enqueueSnackbar('Erro ao adicionar chamado. Tente novamente.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { addChamado, loading, error };
};