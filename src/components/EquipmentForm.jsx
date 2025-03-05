import React, { useState } from 'react';
import {
    TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, Alert, Paper,
} from '@mui/material';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';  // Importando o toast
import 'react-toastify/dist/ReactToastify.css';  // Estilos do react-toastify

const EquipmentForm = ({ onSubmit }) => {
    const [type, setType] = useState('computador');
    const [name, setName] = useState('');  // Nome do equipamento
    const [code, setCode] = useState('');  // Código do equipamento
    const [attributes, setAttributes] = useState({});  // Atributos do equipamento
    const [error, setError] = useState('');  // Estado para exibir o erro
    const [setor, setSetor] = useState('');  // Estado para o setor

    // Função para verificar se o código já existe no banco de dados
    const checkUniqueCode = async () => {
        const codeQuery = query(
            collection(db, 'equipamentos'),
            where('code', '==', code.trim())
        );

        try {
            const codeSnapshot = await getDocs(codeQuery);
            if (!codeSnapshot.empty) {
                return false;  // Código já existe
            }
            return true;  // Código único
        } catch (error) {
            console.error("Erro ao verificar o código:", error);
            setError("Erro ao verificar a unicidade do código.");
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');  // Limpar erros antes da nova tentativa

        // Verificar se o código é único antes de submeter os dados
        const isUniqueCode = await checkUniqueCode();
        if (!isUniqueCode) {
            setError("O código do equipamento já existe.");  // Exibe a mensagem de erro
            return;  // Não envia os dados
        }

        // Se o código for único, chama o método para submeter os dados
        try {
            const equipmentRef = doc(db, 'equipamentos', name);  // Usando o nome como chave do documento
            await setDoc(equipmentRef, {
                name,
                code,
                type,
                attributes,
                setor,
            });

            // Exibe o Toast de Sucesso
            toast.success('Equipamento adicionado com sucesso!');

            // Limpar o formulário após o envio
            setName('');
            setCode('');
            setAttributes({});
            setSetor('');
        } catch (err) {
            console.error("Erro ao salvar equipamento:", err);
            setError("Erro ao salvar equipamento. Tente novamente.");  // Exibe outro tipo de erro
        }
    };

    const handleChangeType = (event) => {
        const newType = event.target.value;
        setType(newType);
        setAttributes({});  // Resetar atributos ao mudar de tipo de equipamento
    };

    const handleAttributeChange = (event, key) => {
        setAttributes({ ...attributes, [key]: event.target.value });
    };

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: "#FAFAFA",
                maxWidth: 600,
                margin: "auto",
            }}
        >
            <Typography variant="h5" align="center" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
                Adicionar Equipamento
            </Typography>

            {/* Exibe erro de código único caso exista */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Tipo</InputLabel>
                    <Select value={type} onChange={handleChangeType}>
                        <MenuItem value="computador">Computador</MenuItem>
                        <MenuItem value="impressora">Impressora</MenuItem>
                        <MenuItem value="telefone">Telefone</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Nome"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    label="Código"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                {/* Seleção do Setor */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>Setor</InputLabel>
                    <Select
                        value={setor}
                        onChange={(e) => setSetor(e.target.value)}
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

                {/* Campos dinâmicos baseados no tipo de equipamento */}
                {type === 'computador' && (
                    <>
                        <TextField
                            label="Memória RAM (GB)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.memoriaRam || ''}
                            onChange={(e) => handleAttributeChange(e, 'memoriaRam')}
                        />
                        <TextField
                            label="Processador"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.processador || ''}
                            onChange={(e) => handleAttributeChange(e, 'processador')}
                        />
                        <TextField
                            label="Armazenamento (GB)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.armazenamento || ''}
                            onChange={(e) => handleAttributeChange(e, 'armazenamento')}
                        />
                    </>
                )}

                {type === 'impressora' && (
                    <>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.modelo || ''}
                            onChange={(e) => handleAttributeChange(e, 'modelo')}
                        />
                        <TextField
                            label="Tipo de Impressão"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.tipoDeImpressao || ''}
                            onChange={(e) => handleAttributeChange(e, 'tipoDeImpressao')}
                        />
                    </>
                )}

                {type === 'telefone' && (
                    <>
                        <TextField
                            label="Modelo"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.modelo || ''}
                            onChange={(e) => handleAttributeChange(e, 'modelo')}
                        />
                        <TextField
                            label="Marca"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={attributes.marca || ''}
                            onChange={(e) => handleAttributeChange(e, 'marca')}
                        />
                    </>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        mt: 2,
                        backgroundColor: "#3f51b5",
                        "&:hover": { backgroundColor: "#303f9f" },
                        textTransform: 'none',
                        borderRadius: 2,
                    }}
                    fullWidth
                >
                    Salvar Equipamento
                </Button>
            </Box>

            {/* Toast Container */}
            <ToastContainer />
        </Paper>
    );
};

export default EquipmentForm;