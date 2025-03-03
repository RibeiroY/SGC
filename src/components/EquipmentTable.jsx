import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Select, MenuItem } from '@mui/material';

const EquipmentTable = ({ equipments, updateEquipment }) => {
    const computers = equipments.filter(equipment => equipment.type === 'computador');
    const printers = equipments.filter(equipment => equipment.type === 'impressora');
    const phones = equipments.filter(equipment => equipment.type === 'telefone');

    // Função para atualizar o setor
    const handleSetorChange = (equipmentId, newSetor) => {
        updateEquipment(equipmentId, { setor: newSetor }); // Atualiza o setor no Firestore
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

            {/* Tabela de Computadores */}
            {computers.length > 0 && (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: 'hidden',
                        width: '100%',
                        marginTop: 3,
                    }}
                >
                    <Table sx={{ width: '100%' }}>
                        <TableHead sx={{ backgroundColor: "#6A1B9A" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Código</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nome</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Memória RAM</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Processador</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Armazenamento</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Setor</TableCell> {/* Nova coluna Setor */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {computers.map((equipment, index) => (
                                <TableRow
                                    key={equipment.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                                    }}
                                >
                                    <TableCell>{equipment.code}</TableCell>
                                    <TableCell>{equipment.name}</TableCell>
                                    <TableCell>{equipment.attributes?.memoriaRam || "N/A"}</TableCell>
                                    <TableCell>{equipment.attributes?.processador || "N/A"}</TableCell>
                                    <TableCell>{equipment.attributes?.armazenamento || "N/A"}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={equipment.setor || ''}
                                            onChange={(e) => handleSetorChange(equipment.id, e.target.value)}
                                            fullWidth
                                            size="small"
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tabela de Impressoras */}
            {printers.length > 0 && (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: 'hidden',
                        width: '100%',
                        marginTop: 3,
                    }}
                >
                    <Table sx={{ width: '100%' }}>
                        <TableHead sx={{ backgroundColor: "#6A1B9A" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Código</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nome</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Modelo</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Setor</TableCell> {/* Nova coluna Setor */}
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo de Impressão</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {printers.map((equipment, index) => (
                                <TableRow
                                    key={equipment.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                                    }}
                                >
                                    <TableCell>{equipment.code}</TableCell>
                                    <TableCell>{equipment.name}</TableCell>
                                    <TableCell>{equipment.attributes?.modelo || "N/A"}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={equipment.setor || ''}
                                            onChange={(e) => handleSetorChange(equipment.id, e.target.value)}
                                            fullWidth
                                            size="small"
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
                                    </TableCell>
                                    <TableCell>{equipment.attributes?.tipoDeImpressao || "N/A"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tabela de Telefones */}
            {phones.length > 0 && (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: 'hidden',
                        width: '100%',
                        marginTop: 3,
                    }}
                >
                    <Table sx={{ width: '100%' }}>
                        <TableHead sx={{ backgroundColor: "#6A1B9A" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Código</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nome</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Modelo</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Marca</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Setor</TableCell> {/* Nova coluna Setor */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {phones.map((equipment, index) => (
                                <TableRow
                                    key={equipment.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                                    }}
                                >
                                    <TableCell>{equipment.code}</TableCell>
                                    <TableCell>{equipment.name}</TableCell>
                                    <TableCell>{equipment.attributes?.modelo || "N/A"}</TableCell>
                                    <TableCell>{equipment.attributes?.marca || "N/A"}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={equipment.setor || ''}
                                            onChange={(e) => handleSetorChange(equipment.id, e.target.value)}
                                            fullWidth
                                            size="small"
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default EquipmentTable;
