// EquipmentsList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, CircularProgress } from '@mui/material';
import EquipmentCard from './EquipmentCard'; // Para mobile
import EquipmentTable from './EquipmentTable'; // Para desktop

const EquipmentsList = () => {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipments = async () => {
            const querySnapshot = await getDocs(collection(db, 'equipamentos'));
            const equipmentList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEquipments(equipmentList);
            setLoading(false);
        };

        fetchEquipments();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2 }}>Carregando Equipamentos...</Typography>
            </Box>
        );
    }

    if (equipments.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>Não há equipamentos cadastrados no momento.</Typography>
            </Box>
        );
    }

    return (
        <Box width={1}>
            <Typography variant="h4" gutterBottom>Equipamentos</Typography>
            <EquipmentTable equipments={equipments} />
            <EquipmentCard equipments={equipments} />
        </Box>
    );
};

export default EquipmentsList;
