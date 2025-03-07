import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid2, 
  useMediaQuery, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider,
  TextField,
  Autocomplete 
} from '@mui/material';
import Sidebar from '../shared/Sidebar';
import EquipmentCard from '../../components/EquipmentCard';
import EquipmentTable from '../../components/EquipmentTable';
import EquipmentDialog from '../EquipmentDialog';
import { useEquipments } from '../../hooks/useEquipments';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Equipments = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { equipments, loading: equipmentsLoading, error, updateEquipment } = useEquipments();
  
  // Estado para exibir o diálogo de adição
  const [openDialog, setOpenDialog] = useState(false);
  
  // Estados para filtros
  const [filterType, setFilterType] = useState("");
  const [filterCode, setFilterCode] = useState(""); // Filtro efetivo para código
  const [searchCode, setSearchCode] = useState(''); // Valor digitado para código
  
  // Estados para filtro de setor
  const [searchSector, setSearchSector] = useState('');
  const [filterSector, setFilterSector] = useState('');
  
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    console.log("[Equipments] Dados do usuário:", currentUser);
  }, [currentUser]);

  if (!currentUser || !currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'technician')) {
    navigate("/login");
    return null;
  }

  const isAdminOrTechnician = currentUser.role === 'admin' || currentUser.role === 'technician';

  const toggleFormVisibility = () => {
    setOpenDialog(prev => !prev);
  };

  // Define os códigos disponíveis (únicos) a partir dos equipamentos
  const availableCodes = Array.from(new Set(equipments.map(equipment => equipment.code).filter(Boolean)));

  // Define os setores disponíveis a partir dos equipamentos
  const availableSectors = Array.from(new Set(equipments.map(equipment => equipment.setor).filter(Boolean)));

  // Ao selecionar um código, o filtro é aplicado automaticamente
  const handleCodeChange = (value) => {
    setSearchCode(value);
    // Limpa o filtro por tipo e setor
    setFilterType("");
    setSearchSector("");
    setFilterSector("");
    // Atualiza o filtro por código para exibir apenas os equipamentos com o código selecionado
    setFilterCode(value.trim());
    // Verifica se há equipamentos com o código selecionado
    const matchingEquipments = equipments.filter(equip => equip.code === value.trim());
    if (matchingEquipments.length > 0) {
      toast.success("Equipamento(s) encontrado(s)!");
    } else {
      toast.error("Equipamento não encontrado.");
      setFilterCode("");
    }
  };

  // Função para atualizar o filtro por setor
  const handleSectorChange = (value) => {
    setSearchSector(value);
    // Limpa os outros filtros
    setFilterType("");
    setSearchCode("");
    setFilterCode("");
    setFilterSector(value.trim());
    const matchingEquipments = equipments.filter(equip => equip.setor === value.trim());
    if (matchingEquipments.length > 0) {
      toast.success("Equipamento(s) encontrado(s)!");
    } else {
      toast.error("Equipamento não encontrado.");
      setFilterSector("");
    }
  };

  // Atualiza o filtro por tipo (mantendo a mesma lógica anterior)
  const handleTypeChange = (value) => {
    setFilterType(value);
    // Limpa os outros filtros
    setSearchCode("");
    setFilterCode("");
    setSearchSector("");
    setFilterSector("");
  };

  // Filtra os equipamentos: se nenhum filtro for definido, retorna array vazio
  const filteredEquipments = equipments.filter((equipment) => {
    // Se nenhum filtro estiver definido, não exibe nada
    if (!filterCode && !filterType && !filterSector) return false;
    
    let match = true;
    if(filterCode) {
      match = match && (equipment.code === filterCode);
    }
    if(filterType) {
      match = match && (equipment.type === filterType);
    }
    if(filterSector) {
      match = match && (equipment.setor === filterSector);
    }
    return match;
  });

  if (equipmentsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#2B1432", color: "#fff" }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Carregando...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <Typography variant="h6" color="error">Falha ao carregar os equipamentos.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f4f4f4" }}>
      <Sidebar />
      <Box sx={{ flex: 1, padding: 3, backgroundColor: "#f4f4f4", minHeight: "100vh", marginLeft: { md: 30 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Gerenciar Equipamentos
        </Typography>

        {/* Seção de filtros */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', md: 'row' }  // Empilha em telas mobile, exibe lado a lado em telas maiores
          }}
        >
          {/* Caixa de busca para código */}
          <Autocomplete
            fullWidth
            freeSolo
            options={availableCodes}
            value={searchCode}
            onChange={(event, newValue) => {
              handleCodeChange(newValue || '');
            }}
            onInputChange={(event, newInputValue) => {
              setSearchCode(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Código" variant="outlined" />
            )}
            sx={{ flex: 1 }}  // Ocupa o espaço disponível proporcionalmente
          />

          {/* Caixa de seleção para tipo */}
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>Selecione o tipo de equipamento</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => {
                handleTypeChange(e.target.value);
              }}
              label="Selecione o tipo de equipamento"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="computador">Computadores</MenuItem>
              <MenuItem value="impressora">Impressoras</MenuItem>
              <MenuItem value="telefone">Telefones</MenuItem>
            </Select>
          </FormControl>

          {/* Caixa de busca para setor */}
          <Autocomplete
            fullWidth
            freeSolo
            options={availableSectors}
            value={searchSector}
            onChange={(event, newValue) => {
              handleSectorChange(newValue || '');
            }}
            onInputChange={(event, newInputValue) => {
              setSearchSector(newInputValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Setor" variant="outlined" />
            )}
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Botão para adicionar novo equipamento */}
        {isAdminOrTechnician && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={toggleFormVisibility}
              sx={{
                width: { xs: '100%', md: 'auto' },
                fontSize: "1rem",
                padding: "12px 24px",
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "scale(1.02)",
                },
              }}
            >
              Adicionar Novo Equipamento
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Exibição dos equipamentos filtrados */}
        <Grid2 container spacing={3}>
          {filteredEquipments.length === 0 ? (
            <Grid2 item xs={12}>
              <Box sx={{ textAlign: "center", padding: 4, borderRadius: 2, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h6" color="textSecondary">
                  Nenhum equipamento encontrado.
                </Typography>
              </Box>
            </Grid2>
          ) : (
            <>
              {isMobile ? (
                <Box>
                  {filteredEquipments.map((equipment) => (
                    <EquipmentCard key={equipment.id} equipment={equipment} updateEquipment={updateEquipment} />
                  ))}
                </Box>
              ) : (
                <EquipmentTable equipments={filteredEquipments} updateEquipment={updateEquipment} />
              )}
            </>
          )}
        </Grid2>
      </Box>

      {/* Dialog de adição */}
      <EquipmentDialog open={openDialog} onClose={toggleFormVisibility} />

      <ToastContainer />
    </Box>
  );
};

export default Equipments;
