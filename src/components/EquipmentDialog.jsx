import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useEquipments } from './../hooks/useEquipments';  
import { db } from './../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import EquipmentForm from './EquipmentForm';

const EquipmentDialog = ({ open, onClose }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const { addEquipment } = useEquipments();  // Usando o hook para adicionar equipamentos

    // Função para verificar se o código já existe no banco de dados
    const checkUniqueCode = async () => {
        console.log("Verificando unicidade do código:", code);

        const codeQuery = query(
            collection(db, 'equipamentos'),
            where('code', '==', code.trim())  // Aqui estamos verificando no campo `code`
        );

        const codeSnapshot = await getDocs(codeQuery);

        console.log("Resultado da consulta para código:", code);
        console.log("Snapshot código:", codeSnapshot.empty ? "Nenhum encontrado" : "Encontrado");

        if (!codeSnapshot.empty) {
            console.log("Código já existe.");
            return false;  // Retorna falso se o código já existir
        }

        console.log("Código único!");
        return true;  // Retorna verdadeiro se o código for único
    };

    const handleSubmit = async (name, code, type, attributes) => {
        // Verifica se o código é único antes de submeter os dados
        const isUniqueCode = await checkUniqueCode();
        if (isUniqueCode) {
            console.log("Código único, submetendo equipamento...");
            await addEquipment(name, code, type, attributes); // Adiciona o equipamento via hook
            onClose(); // Fecha o diálogo
        } else {
            console.log("Código duplicado, alertando...");
            alert("O código do equipamento já existe.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Adicionar Equipamento</DialogTitle>
            <DialogContent>
                <EquipmentForm
                    name={name}
                    setName={setName}
                    code={code}
                    setCode={setCode}
                    onSubmit={handleSubmit}  // Passa a função de submissão com hook
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancelar</Button>
                <Button onClick={() => handleSubmit(name, code, 'computador', {})} color="primary">Salvar</Button> {/* Chama handleSubmit diretamente */}
            </DialogActions>
        </Dialog>
    );
};

export default EquipmentDialog;
