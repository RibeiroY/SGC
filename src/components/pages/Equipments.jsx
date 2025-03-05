import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Container, Grid2, useMediaQuery, TextField, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import EquipmentCard from '../../components/EquipmentCard'; // Cards para mobile
import EquipmentTable from '../../components/EquipmentTable'; // Tabela para desktop
import EquipmentEditDialog from '../../components/EquipmentEditDialog'; // Dialog para editar equipamento
import EquipmentDialog from '../EquipmentDialog';
import Sidebar from '../shared/Sidebar';
import { useEquipments } from '../../hooks/useEquipments';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; // Para exibir o Toast de sucesso
import 'react-toastify/dist/ReactToastify.css';

const Equipments = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { equipments, loading: equipmentsLoading, error, updateEquipment } = useEquipments();
    const [openDialog, setOpenDialog] = useState(false); // Dialog de adicionar equipamento
    const [filterType, setFilterType] = useState(""); // Estado para filtro de tipo de equipamento
    const [openSearchDialog, setOpenSearchDialog] = useState(false); // Dialog de busca de código
    const [searchCode, setSearchCode] = useState(''); // Código para busca
    const [searchedEquipment, setSearchedEquipment] = useState(null); // Equipamento encontrado
    const isMobile = useMediaQuery("(max-width:600px)"); // Para determinar o comportamento de mobile

    useEffect(() => {
        console.log("[Equipments] Dados do usuário:", currentUser);
    }, [currentUser]);

    if (!currentUser || !currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'technician')) {
        navigate("/login");
        return null;
    }

    const isAdminOrTechnician = currentUser.role === 'admin' || currentUser.role === 'technician';

    const toggleFormVisibility = () => {
        setOpenDialog((prev) => !prev); // Alterna a visibilidade do diálogo de adicionar equipamento
    };

    // Buscar equipamento pelo código
    const handleSearchByCode = async () => {
        const codeQuery = query(
            collection(db, 'equipamentos'),
            where('code', '==', searchCode.trim())
        );

        try {
            const querySnapshot = await getDocs(codeQuery);
            if (querySnapshot.empty) {
                toast.error("Equipamento não encontrado.");
                setSearchedEquipment(null);
            } else {
                const equipmentData = querySnapshot.docs[0].data();
                setSearchedEquipment({
                    id: querySnapshot.docs[0].id,
                    ...equipmentData
                });
                setOpenSearchDialog(true); // Abre o dialog de edição
            }
        } catch (error) {
            console.error("Erro ao buscar equipamento:", error);
            toast.error("Erro ao buscar equipamento.");
        }
    };

    // Filtros de equipamentos
    const filteredEquipments = equipments.filter((equipment) =>
        filterType ? equipment.type === filterType : true // Exibe todos se o filtro não estiver definido
    );

    const handleCloseSearchDialog = () => {
        setSearchCode('');
        setSearchedEquipment(null);
        setOpenSearchDialog(false); // Fecha o dialog de edição
    };

    const handleChange = (e, field) => {
        if (searchedEquipment) {
            setSearchedEquipment({
                ...searchedEquipment,
                [field]: e.target.value
            });
        }
    };

    const handleSaveSearchEquipment = async () => {
        try {
            // Usamos o id do equipamento para fazer a atualização
            const updatedData = {
                name: searchedEquipment.name,
                code: searchedEquipment.code,
                type: searchedEquipment.type,  // Tipo não pode ser alterado
                attributes: searchedEquipment.attributes,
                setor: searchedEquipment.setor,
            };
            const equipmentRef = doc(db, 'equipamentos', searchedEquipment.id);
            await updateDoc(equipmentRef, updatedData); // Atualiza usando o Firestore
            toast.success('Equipamento atualizado com sucesso!');
            handleCloseSearchDialog(); // Fecha o dialog após a atualização
        } catch (error) {
            toast.error("Erro ao salvar as alterações.");
        }
    };

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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <Typography variant="h6" color="error">Falha ao carregar os equipamentos.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <Container
                maxWidth="lg"
                sx={{
                    flexGrow: 1,
                    paddingTop: 3,
                    marginLeft: { md: 30 },
                    backgroundColor: "#f4f4f4"
                }}
            >
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Gerenciar Equipamentos
                </Typography>

                {/* Busca por código */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        Busque equipamento por código:
                    </Typography>
                    <TextField
                        label="Buscar por Código"
                        variant="outlined"
                        fullWidth
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            {/* Botão de Buscar */}
                            <Button
                                variant="contained"
                                onClick={handleSearchByCode}
                                sx={{
                                    borderRadius: 2,
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    boxShadow: 2,
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#F96822', // Cor laranja
                                    color: '#fff',
                                    flex: 1, // Ocupa o espaço disponível
                                    '&:hover': {
                                        boxShadow: 4,
                                        transform: 'scale(1.02)',
                                    },
                                }}
                            >
                                Buscar
                            </Button>

                            {/* Botão de Adicionar Novo Equipamento (condicional) */}
                            {isAdminOrTechnician && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{
                                        fontSize: '1rem',
                                        padding: '12px 24px',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        boxShadow: 2,
                                        transition: 'all 0.3s ease',
                                        flex: 1, // Ocupa o espaço disponível
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                    onClick={toggleFormVisibility}
                                >
                                    Adicionar Novo Equipamento
                                </Button>
                            )}
                        </Box>
                    </Box>
                <Divider sx={{ mb: 3 }} />
                {/* Filtro de tipos de equipamentos */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                        Tipos de equipamentos:
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Selecione o tipo de equipamento</InputLabel>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            label="Selecione o tipo de equipamento"
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value="computador">Computadores</MenuItem>
                            <MenuItem value="impressora">Impressoras</MenuItem>
                            <MenuItem value="telefone">Telefones</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Equipamentos filtrados */}
                <Grid2 container spacing={3}>
                    {filteredEquipments.length === 0 ? (
                        <Grid2 item xs={12}>
                            <Box sx={{ textAlign: 'center', padding: 4, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="h6" color="textSecondary">
                                    Nenhum equipamento encontrado para o tipo selecionado.
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
            </Container>

            {/* Dialog de adição */}
            <EquipmentDialog open={openDialog} onClose={toggleFormVisibility} />

            {/* Dialog de edição */}
            <EquipmentEditDialog
                open={openSearchDialog}
                onClose={handleCloseSearchDialog}
                equipment={searchedEquipment}
                onSave={handleCloseSearchDialog}
            />

            <ToastContainer />
        </Box>
    );
};

export default Equipments;