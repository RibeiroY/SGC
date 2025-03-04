import { useState } from 'react';
import { db } from './../firebase/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  runTransaction, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where 
} from 'firebase/firestore';
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
  // Agora, o setor é definido com base no equipamento, se este não for nulo.
  const addChamado = async (titulo, descricao, equipamento, tipo, username) => {
    setLoading(true);
    setError(null);

    try {
      // Obtém o próximo ID formatado
      const chamadoId = await getNextChamadoId();

      // Se o equipamento não estiver vazio ou nulo, consulta a coleção 'equipamentos'
      // para obter o setor associado ao equipamento (usando o campo "code").
      let setor = null;
      if (equipamento) {
        const equipamentosQuery = query(
          collection(db, 'equipamentos'),
          where('code', '==', equipamento.trim())
        );
        const equipamentosSnapshot = await getDocs(equipamentosQuery);
        if (!equipamentosSnapshot.empty) {
          // Se houver pelo menos um equipamento encontrado, pega o primeiro e seu setor
          const equipmentData = equipamentosSnapshot.docs[0].data();
          setor = equipmentData.setor || null;
        }
      }

      // Cria o documento com o ID gerado, incluindo o campo setor, se disponível
      const chamadoRef = doc(db, 'chamados', chamadoId);
      await setDoc(chamadoRef, {
        titulo,
        descricao,
        equipamento,
        tipo,
        username,       // Armazena o username do usuário
        setor,          // Setor baseado no equipamento (pode ser null)
        prioridade: 'Média',  // Prioridade será definida posteriormente
        status: 'Aberto',  // Status padrão
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
