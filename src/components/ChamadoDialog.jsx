import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useChamados } from './../hooks/useChamados';
import { db } from './../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext'; // Importa o contexto de autenticação

// Componente para encapsular o scanner
const QrScannerComponent = ({ onScan, onError, onClose }) => {
  useEffect(() => {
    const config = { fps: 10, qrbox: 250 };
    const scanner = new Html5QrcodeScanner("qr-reader", config, false);

    // Renderiza o scanner e chama o callback onScan quando o QR é lido
    scanner.render(
      (decodedText, decodedResult) => {
        onScan(decodedText);
        // Para o scanner assim que encontrar um QR
        scanner.clear();
      },
      (errorMessage) => {
        // Chama onError sempre que ocorrer um erro
        onError(errorMessage);
      }
    );

    return () => {
      // Limpa o scanner ao desmontar o componente
      scanner.clear().catch((err) => console.error("Falha ao limpar o scanner", err));
    };
  }, [onScan, onError]);

  return (
    <Box>
      <div id="qr-reader" style={{ width: "100%", height: "300px" }} />
      <Button variant="outlined" color="secondary" onClick={onClose} sx={{ marginTop: 2 }}>
        Fechar Leitor
      </Button>
    </Box>
  );
};

const ChamadoDialog = ({ open, onClose }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [tipo, setTipo] = useState(''); // Estado para o tipo de chamado
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { addChamado, loading } = useChamados();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery('(max-width:600px)'); // Verifica se é um dispositivo móvel
  const { currentUser } = useAuth(); // Obtém o usuário logado

  // Estados para erros de validação
  const [errors, setErrors] = useState({
    titulo: false,
    descricao: false,
    equipamento: false,
    tipo: false,
  });

  // Função para validar os campos
  const validateFields = () => {
    const newErrors = {
      titulo: !titulo.trim(),
      descricao: !descricao.trim(),
      equipamento: !equipamento.trim(),
      tipo: !tipo.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error); // Retorna true se não houver erros
  };

  // Função para buscar o username na coleção "usernames"
  const getUsername = async () => {
    // Supondo que o documento tenha um campo "uid" com o ID do usuário e um campo "username"
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('uid', '==', currentUser.uid)
    );
    const querySnapshot = await getDocs(usernameQuery);
    if (!querySnapshot.empty) {
      // Retorna o primeiro documento encontrado
      return querySnapshot.docs[0].data().username;
    }
    return '';
  };

  // Callback quando o QR code é lido
  const handleScan = (data) => {
    if (data) {
      console.log('QR code lido:', data);
      setEquipamento(data);
      setShowQRScanner(false);
      enqueueSnackbar('Código do equipamento lido com sucesso!', { variant: 'success' });
    }
  };

  // Callback para erros
  const handleError = (error) => {
    console.error('Erro ao ler o QR code:', error);
  };

  // Verifica se o equipamento existe no Firestore
  const checkEquipamentoExists = async () => {
    const equipamentoQuery = query(
      collection(db, 'equipamentos'),
      where('code', '==', equipamento.trim())
    );
    const equipamentoSnapshot = await getDocs(equipamentoQuery);
    return !equipamentoSnapshot.empty;
  };

  // Submete o formulário de criação de chamado
  const handleSubmit = async () => {
    // Valida os campos antes de enviar
    if (!validateFields()) {
      enqueueSnackbar('Preencha todos os campos obrigatórios.', { variant: 'error' });
      return;
    }

    const equipamentoExists = await checkEquipamentoExists();
    if (equipamentoExists) {
      const username = await getUsername();
      if (!username) {
        enqueueSnackbar('Não foi possível obter o username.', { variant: 'error' });
        return;
      }
      // Chama addChamado passando o username obtido do Firestore
      await addChamado(titulo, descricao, equipamento, tipo, username);
      onClose();
    } else {
      enqueueSnackbar('O equipamento informado não foi encontrado em nossos registros.', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Novo Chamado</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          {/* Campo Título */}
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            variant="outlined"
            error={errors.titulo}
            helperText={errors.titulo ? 'Este campo é obrigatório.' : ''}
            required
          />
          {/* Campo Descrição */}
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            error={errors.descricao}
            helperText={errors.descricao ? 'Este campo é obrigatório.' : ''}
            required
          />
          {/* Campo Tipo de Chamado */}
          <FormControl fullWidth variant="outlined" error={errors.tipo} required>
            <InputLabel id="tipo-chamado-label">Tipo de Chamado</InputLabel>
            <Select
              labelId="tipo-chamado-label"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              label="Tipo de Chamado"
            >
              <MenuItem value="Requisição">Requisição</MenuItem>
              <MenuItem value="Incidente">Incidente</MenuItem>
            </Select>
            {errors.tipo && (
              <Box sx={{ color: 'red', fontSize: '0.75rem', marginTop: '8px' }}>
                Este campo é obrigatório.
              </Box>
            )}
          </FormControl>
          {/* Campo Código do Equipamento */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Código do Equipamento"
              value={equipamento}
              onChange={(e) => setEquipamento(e.target.value)}
              fullWidth
              variant="outlined"
              error={errors.equipamento}
              helperText={errors.equipamento ? 'Este campo é obrigatório.' : ''}
              required
            />
            {/* Mostra o ícone de QR Code apenas em dispositivos móveis */}
            {isMobile && (
              <IconButton
                color="primary"
                onClick={() => setShowQRScanner(!showQRScanner)}
              >
                <QrCode2Icon />
              </IconButton>
            )}
          </Box>
          {/* Leitor de QR Code */}
          {showQRScanner && (
            <QrScannerComponent 
              onScan={handleScan}
              onError={handleError}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || !titulo || !descricao || !equipamento || !tipo} // Desabilita o botão se algum campo estiver vazio
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChamadoDialog;
