import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, Alert } from '@mui/material';
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
        console.log("Verificando unicidade do código:", code);

        // Criando a consulta para buscar o código no campo 'code'
        const codeQuery = query(
            collection(db, 'equipamentos'),
            where('code', '==', code.trim())  // Garantindo que estamos consultando no campo 'code'
        );

        try {
            // Obtendo os documentos que correspondem à consulta
            const codeSnapshot = await getDocs(codeQuery);

            console.log("Resultado da consulta para código:", code);
            console.log("Snapshot código:", codeSnapshot.empty ? "Nenhum encontrado" : "Encontrado");

            if (!codeSnapshot.empty) {
                console.log("Código já existe.");
                return false;  // Se o código já existir, retorna falso
            }

            console.log("Código único!");
            return true;  // Se o código não existir, retorna verdadeiro
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
            console.log("Submetendo dados do equipamento...");
            
            // Adicionando o equipamento ao Firestore com o nome como chave do documento
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

            // Não chamamos onSubmit aqui, pois o Firestore já foi atualizado diretamente
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
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" align="center" gutterBottom>Adicionar Equipamento</Typography>

            {/* Exibe erro de código único caso exista */}
            {error && <Alert severity="error">{error}</Alert>}

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
                onChange={(e) => setName(e.target.value)}  // Atualiza o nome do equipamento
            />

            <TextField
                label="Código"
                variant="outlined"
                fullWidth
                margin="normal"
                value={code}
                onChange={(e) => setCode(e.target.value)}  // Atualiza o código do equipamento
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
                    backgroundColor: "#F96822",
                    "&:hover": { backgroundColor: "darkorange" },
                }}
                fullWidth
            >
                Salvar Equipamento
            </Button>

            {/* Toast Container */}
            <ToastContainer />
        </Box>
    );
};

export default EquipmentForm;
