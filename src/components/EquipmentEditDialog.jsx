import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem, Button,
} from '@mui/material';
import { db } from './../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit'; // Ícone para o título do diálogo

const EquipmentEditDialog = ({ open, onClose, equipment, onSave }) => {
    const [searchedEquipment, setSearchedEquipment] = useState(null);

    useEffect(() => {
        if (equipment) {
            setSearchedEquipment(equipment);
        }
    }, [equipment]);

    const handleChange = (e, field) => {
        if (searchedEquipment) {
            const updatedAttributes = searchedEquipment.attributes || {};
            if (field in updatedAttributes) {
                updatedAttributes[field] = e.target.value;
            } else {
                updatedAttributes[field] = e.target.value;
            }

            setSearchedEquipment({
                ...searchedEquipment,
                attributes: updatedAttributes,
                [field]: e.target.value,
            });
        }
    };

    const handleSaveEquipment = async () => {
        try {
            const updatedData = {
                name: searchedEquipment.name,
                code: searchedEquipment.code,
                type: searchedEquipment.type,
                attributes: searchedEquipment.attributes,
                setor: searchedEquipment.setor,
            };
            const equipmentRef = doc(db, 'equipamentos', searchedEquipment.id);
            await updateDoc(equipmentRef, updatedData);
            toast.success('Equipamento atualizado com sucesso!');
            onSave();
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar as alterações.");
        }
    };

    if (!searchedEquipment) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#3f51b5', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                <EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Editar Equipamento
            </DialogTitle>
            <DialogContent sx={{ padding: 3 }}>
                {/* Campos de edição */}
                <TextField
                    label="Nome"
                    variant="outlined"
                    fullWidth
                    value={searchedEquipment.name}
                    onChange={(e) => handleChange(e, 'name')}
                    disabled
                    sx={{ marginBottom: 2 }}
                />
                <TextField
                    label="Código"
                    variant="outlined"
                    fullWidth
                    value={searchedEquipment.code}
                    onChange={(e) => handleChange(e, 'code')}
                    disabled
                    sx={{ marginBottom: 2 }}
                />
                <TextField
                    label="Tipo"
                    variant="outlined"
                    fullWidth
                    value={searchedEquipment.type}
                    disabled
                    sx={{ marginBottom: 2 }}
                />

                {/* Setor */}
                <FormControl fullWidth margin="normal" sx={{ marginBottom: 2 }}>
                    <InputLabel>Setor</InputLabel>
                    <Select
                        value={searchedEquipment.setor}
                        onChange={(e) => handleChange(e, 'setor')}
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

                {/* Atributos dinâmicos */}
                {searchedEquipment.type === 'computador' && (
                    <>
                        <TextField
                            label="Memória RAM (GB)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.memoriaRam || ''}
                            onChange={(e) => handleChange(e, 'memoriaRam')}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="Processador"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.processador || ''}
                            onChange={(e) => handleChange(e, 'processador')}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="Armazenamento (GB)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.armazenamento || ''}
                            onChange={(e) => handleChange(e, 'armazenamento')}
                            sx={{ marginBottom: 2 }}
                        />
                    </>
                )}

                {searchedEquipment.type === 'impressora' && (
                    <>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.modelo || ''}
                            onChange={(e) => handleChange(e, 'modelo')}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="Tipo de Impressão"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.tipoDeImpressao || ''}
                            onChange={(e) => handleChange(e, 'tipoDeImpressao')}
                            sx={{ marginBottom: 2 }}
                        />
                    </>
                )}

                {searchedEquipment.type === 'telefone' && (
                    <>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.modelo || ''}
                            onChange={(e) => handleChange(e, 'modelo')}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="Marca"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={searchedEquipment.attributes?.marca || ''}
                            onChange={(e) => handleChange(e, 'marca')}
                            sx={{ marginBottom: 2 }}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ padding: 3 }}>
                <Button onClick={onClose} color="secondary" sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Cancelar
                </Button>
                <Button onClick={handleSaveEquipment} color="primary" sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Salvar Alterações
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EquipmentEditDialog;