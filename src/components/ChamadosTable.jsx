import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Select, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChamadosTable = ({ chamados, updateChamado }) => {
    const navigate = useNavigate();

    // Função para atualizar o status do chamado
    const handleStatusChange = (chamadoId, newStatus) => {
        updateChamado(chamadoId, { status: newStatus }); // Atualiza o status no Firestore
    };

    // Função para atualizar a prioridade do chamado
    const handlePrioridadeChange = (chamadoId, newPrioridade) => {
        updateChamado(chamadoId, { prioridade: newPrioridade }); // Atualiza a prioridade no Firestore
    };

    // Função para navegar para os detalhes do chamado
    const handleVerDetalhes = (chamadoId) => {
        navigate(`/chamados/${chamadoId}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {/* Tabela de Chamados */}
            {chamados.length > 0 && (
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
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Título</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Equipamento</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Prioridade</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aberto por</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {chamados.map((chamado, index) => (
                                <TableRow
                                    key={chamado.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? "#EDE7F6" : "#D1C4E9",
                                    }}
                                >
                                    <TableCell>{chamado.titulo}</TableCell>
                                    <TableCell>{chamado.equipamento}</TableCell>
                                    <TableCell>{chamado.tipo}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={chamado.status || 'aberto'}
                                            onChange={(e) => handleStatusChange(chamado.id, e.target.value)}
                                            fullWidth
                                            size="small"
                                        >
                                            <MenuItem value="aberto">Aberto</MenuItem>
                                            <MenuItem value="em atendimento">Em Atendimento</MenuItem>
                                            <MenuItem value="fechado">Fechado</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={chamado.prioridade || 'baixa'}
                                            onChange={(e) => handlePrioridadeChange(chamado.id, e.target.value)}
                                            fullWidth
                                            size="small"
                                        >
                                            <MenuItem value="baixa">Baixa</MenuItem>
                                            <MenuItem value="média">Média</MenuItem>
                                            <MenuItem value="alta">Alta</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>{chamado.username}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleVerDetalhes(chamado.id)}
                                        >
                                            Ver Detalhes
                                        </Button>
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

export default ChamadosTable;