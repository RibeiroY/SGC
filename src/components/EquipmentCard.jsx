import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Avatar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build'; // Ícone para equipamentos

const EquipmentCard = ({ equipment, updateEquipment }) => {
    const [setor, setSetor] = useState(equipment.setor || '');  // Estado para controlar o setor selecionado

    // Função para atualizar o setor
    const handleSetorChange = (event) => {
        const newSetor = event.target.value;
        setSetor(newSetor);
        updateEquipment(equipment.id, { setor: newSetor }); // Chama a função de atualização
    };

    // Verifica se o equipamento existe antes de acessar suas propriedades
    if (!equipment) {
        return null;  // Não renderiza nada se o equipamento não existir
    }

    return (
        <Card
            sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#FAFAFA",
                borderLeft: `6px solid ${equipment.isActive ? "#4CAF50" : "#F44336"}`,
                "&:hover": {
                    transform: "scale(1.02)",
                    transition: "0.2s ease-in-out",
                },
            }}
        >
            {/* Avatar com o ícone do equipamento */}
            <Avatar sx={{ bgcolor: "#6A1B9A", width: 50, height: 50 }}>
                <BuildIcon />
            </Avatar>

            {/* Conteúdo do card */}
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4A148C" }}>
                    {equipment.name || "Equipamento sem nome"}
                </Typography>

                {/* Código e tipo do equipamento */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        Código: {equipment.code || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Tipo: {equipment.type || "N/A"}
                    </Typography>
                </Box>

                {/* Exibe atributos específicos com base no tipo */}
                {equipment.type === 'computador' && (
                    <Box>
                        <Typography variant="body2">Memória RAM: {equipment.attributes?.memoriaRam || "N/A"}</Typography>
                        <Typography variant="body2">Processador: {equipment.attributes?.processador || "N/A"}</Typography>
                        <Typography variant="body2">Armazenamento: {equipment.attributes?.armazenamento || "N/A"}</Typography>
                    </Box>
                )}

                {equipment.type === 'impressora' && (
                    <Box>
                        <Typography variant="body2">Modelo: {equipment.attributes?.modelo || "N/A"}</Typography>
                        <Typography variant="body2">Tipo de Impressão: {equipment.attributes?.tipoDeImpressao || "N/A"}</Typography>
                    </Box>
                )}

                {equipment.type === 'telefone' && (
                    <Box>
                        <Typography variant="body2">Modelo: {equipment.attributes?.modelo || "N/A"}</Typography>
                        <Typography variant="body2">Marca: {equipment.attributes?.marca || "N/A"}</Typography>
                    </Box>
                )}

                {/* Setor - Campo Select para editar o setor */}
                <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Setor</InputLabel>
                        <Select
                            value={setor}
                            onChange={handleSetorChange}
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
                </Box>

                <Button variant="contained" color="primary" sx={{ mt: 2 }}>Ver Detalhes</Button>
            </Box>
        </Card>
    );
};

export default EquipmentCard;
