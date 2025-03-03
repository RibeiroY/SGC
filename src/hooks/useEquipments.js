import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, setDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

export const useEquipments = () => {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Usando o onSnapshot para garantir a atualização em tempo real dos equipamentos
        const unsubscribe = onSnapshot(
            collection(db, 'equipamentos'),
            (snapshot) => {
                const equipmentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEquipments(equipmentsData);
                setLoading(false); // Dados carregados
            },
            (error) => {
                console.error("Erro ao buscar equipamentos:", error);
                setLoading(false);
            }
        );

        // Cleanup function to unsubscribe from the real-time listener when the component unmounts
        return () => unsubscribe();
    }, []); // O useEffect será chamado apenas uma vez após o primeiro render

    const addEquipment = async (name, code, type, attributes, setor) => {
        try {
            // Usando o nome como a chave do documento
            const equipmentRef = doc(db, 'equipamentos', name);  // Usando o nome como ID
            await setDoc(equipmentRef, {
                name,
                code,
                type,
                attributes,
                createdAt: new Date(),
                isActive: true,
                setor: setor || null,
            });
            // Não é mais necessário recarregar os equipamentos, já que estamos usando onSnapshot
        } catch (error) {
            console.error('Erro ao adicionar equipamento: ', error);
        }
    };

    const updateEquipment = async (id, updatedData) => {
        try {
            const equipmentRef = doc(db, 'equipamentos', id);
            await updateDoc(equipmentRef, updatedData);
            // Não é mais necessário recarregar os equipamentos, já que estamos usando onSnapshot
        } catch (error) {
            console.error("Erro ao atualizar equipamento:", error);
        }
    };

    return { equipments, loading, addEquipment, updateEquipment };
};
