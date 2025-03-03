import { useState } from 'react';
import { db } from './../firebase/firebase';
import { collection, doc, setDoc, runTransaction, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useSnackbar } from 'notistack';

export const useChamados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Função para obter o próximo ID de chamado de forma transacional
  const getNextChamadoId = async () => {
    const counterRef = doc(db, 'counters', 'chamados_counter');
    try {
      const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let count = 0;

        if (!counterDoc.exists()) {
          // Não existe um contador; busca o último chamado registrado
          const chamadosRef = collection(db, 'chamados');
          const chamadosQuery = query(chamadosRef, orderBy('chamadoId', 'desc'), limit(1));
          const querySnapshot = await getDocs(chamadosQuery);

          if (!querySnapshot.empty) {
            // Se houver pelo menos um chamado, pega o id (document id) do último
            const lastChamadoId = querySnapshot.docs[0].id;
            count = parseInt(lastChamadoId, 10);
          } else {
            // Nenhum chamado foi encontrado; inicia do zero
            count = 0;
          }

          count = count + 1;
          transaction.set(counterRef, { count });
        } else {
          // Se o contador existir, apenas incremente
          count = counterDoc.data().count + 1;
          transaction.update(counterRef, { count });
        }
        return count;
      });
      // Formata o número com 10 dígitos (ex.: 1 -> "0000000001")
      return String(newId).padStart(10, '0');
    } catch (error) {
      console.error("Falha ao obter o próximo ID do chamado: ", error);
      throw error;
    }
  };

  // Função para adicionar um novo chamado utilizando o chamadoId como chave do documento
  const addChamado = async (titulo, descricao, equipamento, tipo, username) => {
    setLoading(true);
    setError(null);

    try {
      // Obtém o próximo ID formatado
      const chamadoId = await getNextChamadoId();

      // Cria o documento com o ID gerado
      const chamadoRef = doc(db, 'chamados', chamadoId);
      await setDoc(chamadoRef, {
        titulo,
        descricao,
        equipamento,
        tipo,
        username,       // Armazena o username do usuário
        prioridade: null,  // Prioridade será definida posteriormente
        status: 'aberto',  // Status padrão
        createdAt: new Date(),  // Data de criação
      });

      enqueueSnackbar('Chamado adicionado com sucesso!', { variant: 'success' });
      console.log('Chamado adicionado com sucesso!');
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
