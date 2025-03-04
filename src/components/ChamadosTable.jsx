import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Select, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ChamadosTable = ({ chamados, updateChamado, editable }) => {
    const navigate = useNavigate();

    // Função para atualizar o status do chamado
    const handleStatusChange = (chamadoId, newStatus) => {
        if (editable) {
            updateChamado(chamadoId, { status: newStatus }); // Atualiza o status no Firestore
        }
    };

    // Função para atualizar a prioridade do chamado
    const handlePrioridadeChange = (chamadoId, newPrioridade) => {
        if (editable) {
            updateChamado(chamadoId, { prioridade: newPrioridade }); // Atualiza a prioridade no Firestore
        }
    };

    // Função para navegar para os detalhes do chamado
    const handleVerDetalhes = (chamadoId) => {
        navigate(`/chamados/${chamadoId}`);
    };

    // Função para obter a cor com base na prioridade
    const getPrioridadeColor = (prioridade) => {
        switch (prioridade) {
            case 'Baixa':
                return '#4CAF50'; // Verde
            case 'Média':
                return '#FF9800'; // Laranja
            case 'Alta':
                return '#F44336'; // Vermelho
            default:
                return '#000000'; // Preto (padrão)
        }
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
                                        transition: 'background-color 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: '#B39DDB', // Cor de hover
                                        },
                                    }}
                                >
                                    <TableCell>{chamado.titulo}</TableCell>
                                    <TableCell>{chamado.equipamento}</TableCell>
                                    <TableCell>{chamado.tipo}</TableCell>
                                    <TableCell>
                                        {editable ? (
                                            <Select
                                                value={chamado.status || 'Aberto'}
                                                onChange={(e) => handleStatusChange(chamado.id, e.target.value)}
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    borderRadius: 2,
                                                    backgroundColor: '#FFFFFF',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#6A1B9A',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Aberto">Aberto</MenuItem>
                                                <MenuItem value="Em Atendimento">Em Atendimento</MenuItem>
                                                <MenuItem value="Fechado">Fechado</MenuItem>
                                            </Select>
                                        ) : (
                                            <Typography>{chamado.status || 'Aberto'}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editable ? (
                                            <Select
                                                value={chamado.prioridade || 'Baixa'}
                                                onChange={(e) => handlePrioridadeChange(chamado.id, e.target.value)}
                                                fullWidth
                                                size="small"
                                                sx={{
                                                    borderRadius: 2,
                                                    color: getPrioridadeColor(chamado.prioridade),
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#FFFFFF',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#6A1B9A',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Baixa" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Baixa</MenuItem>
                                                <MenuItem value="Média" sx={{ color: '#FF9800', fontWeight: 'bold' }}>Média</MenuItem>
                                                <MenuItem value="Alta" sx={{ color: '#F44336', fontWeight: 'bold' }}>Alta</MenuItem>
                                            </Select>
                                        ) : (
                                            <Typography
                                                sx={{
                                                    color: getPrioridadeColor(chamado.prioridade),
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {chamado.prioridade || 'Baixa'}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{chamado.username}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleVerDetalhes(chamado.id)}
                                            sx={{
                                                borderRadius: 2,
                                                padding: '8px 16px',
                                                fontSize: '0.875rem',
                                                textTransform: 'none',
                                                backgroundColor: '#6A1B9A',
                                                color: '#FFFFFF',
                                                boxShadow: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#4A148C',
                                                    boxShadow: 4,
                                                    transform: 'scale(1.05)',
                                                },
                                            }}
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