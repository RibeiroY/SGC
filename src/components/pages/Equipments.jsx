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
  Divider 
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
  const [searchCode, setSearchCode] = useState(''); // Valor selecionado no dropdown
  
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

  // Ao selecionar um código, o filtro é aplicado automaticamente
  const handleCodeChange = (value) => {
    setSearchCode(value);
    // Limpa o filtro por tipo
    setFilterType("");
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

  // Filtra os equipamentos: se nenhum filtro for definido, retorna array vazio
  const filteredEquipments = equipments.filter((equipment) => {
    if (!filterCode && !filterType) return false;
    if (filterCode && filterType) {
      return equipment.code === filterCode && equipment.type === filterType;
    }
    if (filterCode) return equipment.code === filterCode;
    if (filterType) return equipment.type === filterType;
    return false;
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

        {/* Seção de filtro por código via dropdown */}
        <Box sx={{ mb: 3 }}>
                <Grid2 container spacing={2}>
                    {/* Filtro por código */}
                    <Grid2 xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
                        Selecione o código do equipamento:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Código</InputLabel>
                        <Select
                        value={searchCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        label="Código"
                        sx={{ borderRadius: 2 }}
                        >
                        {availableCodes.map((code) => (
                            <MenuItem key={code} value={code}>{code}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    </Grid2>
                          {/* Divider vertical para telas md ou maiores */}
                            <Grid2 xs={0} md={2} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
                                <Box sx={{ borderLeft: "1px solid #ccc", height: "100%" }} />
                            </Grid2>
                    {/* Filtro por tipo */}
                    <Grid2 xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
                        Tipos de equipamentos:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Selecione o tipo de equipamento</InputLabel>
                        <Select
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            // Limpa o filtro por código quando o filtro por tipo é selecionado
                            setSearchCode("");
                            setFilterCode("");
                        }}
                        label="Selecione o tipo de equipamento"
                        sx={{ borderRadius: 2 }}
                        >
                        <MenuItem value="computador">Computadores</MenuItem>
                        <MenuItem value="impressora">Impressoras</MenuItem>
                        <MenuItem value="telefone">Telefones</MenuItem>
                        </Select>
                    </FormControl>
                    </Grid2>
                </Grid2>
            <Divider sx={{ mt: 3 }} />
        </Box>


        {/* Botão para adicionar novo equipamento */}
        {isAdminOrTechnician && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={toggleFormVisibility}
              sx={{
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
