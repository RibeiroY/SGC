import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../shared/Sidebar';
import { useSnackbar } from 'notistack';

const EquipamentoDetalhes = () => {
  const { id } = useParams(); // Obtém o ID do equipamento da URL
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Obtém o usuário logado
  const [equipment, setEquipment] = useState(null); // Estado para armazenar os detalhes do equipamento
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const { enqueueSnackbar } = useSnackbar();

  // Estados para edição
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [setor, setSetor] = useState('');
  const [attributes, setAttributes] = useState({});

  // Verifica se o usuário é técnico ou administrador
  const isTechnicianOrAdmin = currentUser?.role === 'technician' || currentUser?.role === 'admin';

  // Efeito para redirecionar se o usuário não estiver logado
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Busca os detalhes do equipamento
  useEffect(() => {
    const fetchEquipment = async () => {
      const docRef = doc(db, 'equipamentos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEquipment({ id: docSnap.id, ...data });
        setName(data.name);
        setCode(data.code);
        setType(data.type);
        setSetor(data.setor || '');
        setAttributes(data.attributes || {});
        setLoading(false);
      } else {
        enqueueSnackbar('Equipamento não encontrado!', { variant: 'error' });
        navigate('/equipamentos'); // Redireciona para a lista de equipamentos
      }
    };

    fetchEquipment();
  }, [id, navigate, enqueueSnackbar]);

  // Função para atualizar o equipamento
  const handleUpdateEquipment = async () => {
    try {
      const equipmentRef = doc(db, 'equipamentos', id);
      await updateDoc(equipmentRef, {
        name,
        code,
        type,
        setor,
        attributes,
      });
      enqueueSnackbar('Equipamento atualizado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar o equipamento.', { variant: 'error' });
    }
  };

  // Função para renderizar atributos dinâmicos com base no tipo de equipamento
  const renderAttributes = () => {
    switch (type) {
      case 'computador':
        return (
          <>
            <TextField
              label="Memória RAM (GB)"
              value={attributes.memoriaRam || ''}
              onChange={(e) => setAttributes({ ...attributes, memoriaRam: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Processador"
              value={attributes.processador || ''}
              onChange={(e) => setAttributes({ ...attributes, processador: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Armazenamento (GB)"
              value={attributes.armazenamento || ''}
              onChange={(e) => setAttributes({ ...attributes, armazenamento: e.target.value })}
              fullWidth
              margin="normal"
            />
          </>
        );
      case 'impressora':
        return (
          <>
            <TextField
              label="Modelo"
              value={attributes.modelo || ''}
              onChange={(e) => setAttributes({ ...attributes, modelo: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Tipo de Impressão"
              value={attributes.tipoDeImpressao || ''}
              onChange={(e) => setAttributes({ ...attributes, tipoDeImpressao: e.target.value })}
              fullWidth
              margin="normal"
            />
          </>
        );
      case 'telefone':
        return (
          <>
            <TextField
              label="Modelo"
              value={attributes.modelo || ''}
              onChange={(e) => setAttributes({ ...attributes, modelo: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Marca"
              value={attributes.marca || ''}
              onChange={(e) => setAttributes({ ...attributes, marca: e.target.value })}
              fullWidth
              margin="normal"
            />
          </>
        );
      default:
        return null;
    }
  };

  // Se ainda não carregou o equipamento ou o currentUser estiver nulo, exibe uma mensagem de carregamento
  if (loading || !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f0f0f0' }}>
        {/* Título do equipamento */}
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            textAlign: { xs: 'center', md: 'left' },
            color: '#4A148C',
          }}
        >
          Detalhes do Equipamento: {equipment.name}
        </Typography>
        <Divider />
        {/* Detalhes do Equipamento */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            boxShadow: 3,
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Nome do Equipamento */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Nome:
          </Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            disabled // Desabilitado para edição
          />
          <Divider sx={{ my: 2 }} />
          {/* Código do Equipamento */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Código:
          </Typography>
          <TextField
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            margin="normal"
            disabled // Desabilitado para edição
          />
          <Divider sx={{ my: 2 }} />
          {/* Tipo do Equipamento */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Tipo:
          </Typography>
          <FormControl fullWidth margin="normal" disabled>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="computador">Computador</MenuItem>
              <MenuItem value="impressora">Impressora</MenuItem>
              <MenuItem value="telefone">Telefone</MenuItem>
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          {/* Setor do Equipamento */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Setor:
          </Typography>
          <FormControl fullWidth margin="normal" disabled={!isTechnicianOrAdmin}>
            <InputLabel>Setor</InputLabel>
            <Select
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              label="Setor"
            >
              <MenuItem value="TI">TI</MenuItem>
              <MenuItem value="Administração">Administração</MenuItem>
              <MenuItem value="Jurídico">Jurídico</MenuItem>
              <MenuItem value="Financeiro">Financeiro</MenuItem>
              <MenuItem value="RH">RH</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Vendas">Vendas</MenuItem>
              <MenuItem value="Recepção">Recepção</MenuItem>
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          {/* Atributos Dinâmicos */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#6A1B9A' }}>
            Atributos:
          </Typography>
          {renderAttributes()}
          {/* Botão de Atualização */}
          {isTechnicianOrAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateEquipment}
              sx={{
                mt: 2,
                borderRadius: 2,
                padding: '12px 24px',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 2,
                backgroundColor: '#6A1B9A',
                color: '#FFFFFF',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#4A148C',
                  boxShadow: 4,
                  transform: 'scale(1.02)',
                },
              }}
            >
              Atualizar Equipamento
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default EquipamentoDetalhes;
