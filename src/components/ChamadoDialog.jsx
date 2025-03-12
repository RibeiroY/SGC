import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useChamados } from './../hooks/useChamados';
import { db } from './../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useAuth } from '../contexts/AuthContext';
import SaveIcon from '@mui/icons-material/Save';
import QrScanner from './shared/QrScanner';

const ChamadoDialog = ({ open, onClose }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [tipo, setTipo] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { addChamado, loading } = useChamados();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { currentUser } = useAuth();

  const [errors, setErrors] = useState({
    titulo: false,
    descricao: false,
    equipamento: false,
    tipo: false,
  });

  const validateFields = () => {
    const newErrors = {
      titulo: !titulo.trim(),
      descricao: !descricao.trim(),
      equipamento: !equipamento.trim(),
      tipo: !tipo.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const getUserData = async () => {
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('uid', '==', currentUser.uid)
    );
    const querySnapshot = await getDocs(usernameQuery);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      return {
        username: data.username,
        role: data.role || 'user',
        setor: data.setor || ''
      };
    }
    return { username: '', role: 'user', setor: '' };
  };

  const handleScan = useCallback(
    (data) => {
      if (data) {
        console.log('QR code lido:', data);
        setEquipamento(data);
        setShowQRScanner(false);
        enqueueSnackbar('Código do equipamento lido com sucesso!', { variant: 'success' });
      }
    },
    [enqueueSnackbar]
  );

  const handleError = useCallback(
    (error) => {
      console.error('Erro ao ler o QR code:', error);
    },
    []
  );

  const checkEquipamentoExists = async () => {
    const equipamentoQuery = query(
      collection(db, 'equipamentos'),
      where('code', '==', equipamento.trim())
    );
    const equipamentoSnapshot = await getDocs(equipamentoQuery);
    if (!equipamentoSnapshot.empty) {
      return equipamentoSnapshot.docs[0].data();
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      enqueueSnackbar('Preencha todos os campos obrigatórios.', { variant: 'error' });
      return;
    }

    const equipamentoData = await checkEquipamentoExists();
    if (equipamentoData) {
      const userData = await getUserData();
      if (!userData.username) {
        enqueueSnackbar('Não foi possível obter o username.', { variant: 'error' });
        return;
      }

      if (userData.role === 'user' && userData.setor !== equipamentoData.setor) {
        enqueueSnackbar('Você não pode abrir chamados para equipamentos de outro setor.', { variant: 'error' });
        return;
      }

      await addChamado(titulo, descricao, equipamento, tipo, userData.username);
      onClose();
    } else {
      enqueueSnackbar('O equipamento informado não foi encontrado em nossos registros.', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#3f51b5', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
        Criar Novo Chamado
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            variant="outlined"
            error={errors.titulo}
            helperText={errors.titulo ? 'Este campo é obrigatório.' : ''}
            required
            sx={{ mt: 2 }}
          />
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
            {isMobile && (
              <IconButton color="primary" onClick={() => setShowQRScanner((prev) => !prev)}>
                <QrCode2Icon />
              </IconButton>
            )}
          </Box>
          {showQRScanner && (
            <QrScanner 
              onScan={handleScan}
              onError={handleError}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 3 }}>
        <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none', borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={loading || !titulo || !descricao || !equipamento || !tipo}
          sx={{ textTransform: 'none', borderRadius: 2 }}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChamadoDialog;