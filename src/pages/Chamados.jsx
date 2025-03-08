import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  useMediaQuery,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import ChamadoDialog from '../components/ChamadoDialog';
import ChamadosTable from '../components/ChamadosTable';
import ChamadosCard from '../components/ChamadosCard';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrScanner from '../components/shared/QrScanner';

const Chamados = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');

  // Estado para exibir o QR Scanner
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Diálogo de criação
  const [openDialog, setOpenDialog] = useState(false);

  // Dados brutos e filtrados
  const [rawChamados, setRawChamados] = useState([]);
  const [chamados, setChamados] = useState([]);

  // Filtros
  const [searchTitle, setSearchTitle] = useState("");
  const [searchOsId, setSearchOsId] = useState("");
  const [searchEquipamento, setSearchEquipamento] = useState("");
  const [searchSetor, setSearchSetor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Função para abrir/fechar o scanner QR
  const toggleQRScanner = () => {
    setShowQRScanner((prev) => !prev);
  };

  // Busca os chamados
  const fetchChamados = async () => {
    try {
      const chamadosQuery = query(
        collection(db, 'chamados'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(chamadosQuery);
      const chamadosData = [];
      querySnapshot.forEach((docSnap) => {
        chamadosData.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRawChamados(chamadosData);
      applyFilters(chamadosData);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  };

  // Aplica filtros nos chamados
  const applyFilters = (data) => {
    let filtered = data;
    if (filterStatus) filtered = filtered.filter(ch => ch.status === filterStatus);
    if (filterPriority) filtered = filtered.filter(ch => ch.prioridade === filterPriority);
    if (searchEquipamento) filtered = filtered.filter(ch => ch.equipamento?.toLowerCase().includes(searchEquipamento.toLowerCase()));
    if (searchSetor) filtered = filtered.filter(ch => ch.setor?.toLowerCase().includes(searchSetor.toLowerCase()));
    if (searchTitle) filtered = filtered.filter(ch => ch.titulo?.toLowerCase().includes(searchTitle.toLowerCase()));
    if (searchOsId) filtered = filtered.filter(ch => ch.id.toLowerCase().includes(searchOsId.toLowerCase()));
    setChamados(filtered);
  };

  useEffect(() => {
    if (currentUser) {
      fetchChamados();
    } else {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    applyFilters(rawChamados);
  }, [filterStatus, filterPriority, searchEquipamento, searchSetor, searchTitle, searchOsId, rawChamados]);

  const handleCreateChamado = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    fetchChamados();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 3, backgroundColor: "#f4f4f4", minHeight: "100vh", ml: { md: 30 } }}>
        <Typography variant="h4" gutterBottom>
          Gerenciar Ordens de Serviço
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateChamado}
          sx={{
            mb: 3,
            width: '100%',
            textTransform: 'none',
            backgroundColor: '#F96822',
            color: '#fff',
            '&:hover': { backgroundColor: '#e55d1d' }
          }}
        >
          Criar Novo Chamado
        </Button>
        <Divider sx={{ mb: 3 }} />

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={rawChamados.map(ch => ch.titulo).filter(Boolean)}
            value={searchTitle}
            onChange={(event, newValue) => setSearchTitle(newValue || "")}
            renderInput={(params) => <TextField {...params} label="Título" variant="outlined" />}
          />
          <Autocomplete
            fullWidth
            freeSolo
            options={rawChamados.map(ch => ch.id).filter(Boolean)}
            value={searchOsId}
            onChange={(event, newValue) => setSearchOsId(newValue || "")}
            renderInput={(params) => <TextField {...params} label="ID da OS" variant="outlined" />}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Autocomplete
              fullWidth
              freeSolo
              options={rawChamados.map(ch => ch.equipamento).filter(Boolean)}
              value={searchEquipamento}
              onChange={(event, newValue) => setSearchEquipamento(newValue || "")}
              renderInput={(params) => <TextField {...params} label="Equipamento" variant="outlined" />}
            />
            {isMobile && (
              <IconButton
                color="primary"
                onClick={toggleQRScanner} // Abrir ou fechar o scanner
                sx={{
                  ml: 1,
                  backgroundColor: '#3f51b5',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#303f9f' }
                }}
              >
                <QrCode2Icon />
              </IconButton>
            )}
          </Box>
          <Autocomplete
            fullWidth
            freeSolo
            options={rawChamados.map(ch => ch.setor).filter(Boolean)}
            value={searchSetor}
            onChange={(event, newValue) => setSearchSetor(newValue || "")}
            renderInput={(params) => <TextField {...params} label="Setor" variant="outlined" />}
          />
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">— Padrão (exclui "fechado") —</MenuItem>
              <MenuItem value="Aberto">Aberto</MenuItem>
              <MenuItem value="Em andamento">Em andamento</MenuItem>
              <MenuItem value="Fechado">Fechado</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Prioridade"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Baixa">Baixa</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* QR Scanner Exibido Condicionalmente */}
        {showQRScanner && (
          <Box sx={{ p: 2, position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
            <QrScanner
              onScan={(data) => {
                setSearchEquipamento(data); // Atualiza o filtro com o código escaneado
                setShowQRScanner(false); // Fecha o scanner após escanear
              }}
              onError={() => {}} // Não faz nada em caso de erro
              onClose={() => setShowQRScanner(false)} // Fecha o scanner manualmente
              config={{
                facingMode: 'environment',
                showViewFinder: true,
                showScanArea: true,
                fps: 10,
                qrbox: 250,
                aspectRatio: 1,
              }}
            />
          </Box>
        )}

        {/* Exibição dos chamados */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {chamados.map((chamado) => (
              <ChamadosCard key={chamado.id} chamado={chamado} />
            ))}
          </Box>
        ) : (
          <ChamadosTable chamados={chamados} />
        )}

        <ChamadoDialog open={openDialog} onClose={handleCloseDialog} />
      </Box>
    </Box>
  );
};

export default Chamados;
