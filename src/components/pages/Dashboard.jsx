import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid2, Divider } from '@mui/material';
import { useEquipments } from '../../hooks/useEquipments'; // Hook para equipamentos
import { useChamados } from '../../hooks/useChamados'; // Hook para chamados
import { Doughnut, Bar, Line } from 'react-chartjs-2'; // Gráficos
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { format, subDays } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext'; // Contexto de autenticação
import { useNavigate } from 'react-router-dom'; // Para redirecionamento
import Sidebar from '../shared/Sidebar'; // Componente Sidebar

// Importe e registre os componentes do Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Dashboard = () => {
    const { currentUser } = useAuth(); // Obtém o usuário logado
    const navigate = useNavigate(); // Para redirecionamento
    const { equipments, loading: loadingEquipments } = useEquipments();
    const { addChamado, loading: loadingChamados } = useChamados();
    const [chamados, setChamados] = useState([]);

    // Verificação de login e role
    useEffect(() => {
        if (!currentUser) {
            navigate('/login'); // Redireciona para a página de login se o usuário não estiver logado
        } else if (currentUser.role !== 'admin') {
            navigate('/home'); // Redireciona para uma página de acesso negado
        }
    }, [currentUser, navigate]);

    // Carrega os chamados em tempo real
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'chamados'), (snapshot) => {
            const chamadosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChamados(chamadosData);
        });

        return () => unsubscribe();
    }, []);

    // Funções para calcular os dados do dashboard
    const totalEquipamentos = equipments.length;
    const totalChamadosAbertos = chamados.filter(chamado => chamado.status === 'Aberto').length;
    const totalChamadosEmAtendimento = chamados.filter(chamado => chamado.status === 'Em Atendimento').length;
    const totalChamadosFechados = chamados.filter(chamado => chamado.status === 'Fechado').length;

    // Dados para gráficos
    const chamadosPorPrioridade = {
        Baixa: chamados.filter(chamado => chamado.prioridade === 'Baixa').length,
        Média: chamados.filter(chamado => chamado.prioridade === 'Média').length,
        Alta: chamados.filter(chamado => chamado.prioridade === 'Alta').length,
    };

    const chamadosPorStatus = {
        Aberto: chamados.filter(chamado => chamado.status === 'Aberto').length,
        EmAtendimento: chamados.filter(chamado => chamado.status === 'Em Atendimento').length,
        Fechado: chamados.filter(chamado => chamado.status === 'Fechado').length,
    };

    // Equipamentos com mais chamados (top 5)
    const equipamentosComMaisChamados = equipments
        .map(equipment => ({
            name: equipment.name,
            chamadosCount: equipment.chamadosCount || 0,
        }))
        .sort((a, b) => b.chamadosCount - a.chamadosCount)
        .slice(0, 5);

    // Últimos 5 chamados registrados
    const ultimosChamados = chamados
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

    // Gráfico de linhas: Total de chamados abertos nos últimos 30 dias
    const getChamadosAbertosUltimos30Dias = () => {
        const hoje = new Date();
        const dias = Array.from({ length: 30 }, (_, i) => subDays(hoje, i)).reverse(); // Últimos 30 dias

        const chamadosPorDia = dias.map(dia => {
            const chamadosNoDia = chamados.filter(chamado => {
                const dataChamado = chamado.createdAt.toDate();
                return (
                    dataChamado.getDate() === dia.getDate() &&
                    dataChamado.getMonth() === dia.getMonth() &&
                    dataChamado.getFullYear() === dia.getFullYear() &&
                    chamado.status === 'Aberto'
                );
            });
            return chamadosNoDia.length;
        });

        return {
            labels: dias.map(dia => format(dia, 'dd/MM')),
            datasets: [
                {
                    label: 'Chamados Abertos',
                    data: chamadosPorDia,
                    borderColor: '#3f51b5', // Azul
                    backgroundColor: 'rgba(63, 81, 181, 0.2)', // Azul com transparência
                    fill: true,
                    tension: 0.4, // Suaviza a linha
                },
            ],
        };
    };

    const dataLinhas = getChamadosAbertosUltimos30Dias();

    // Dados para o gráfico de pizza (Chamados por Prioridade)
    const dataPizza = {
        labels: ['Baixa', 'Média', 'Alta'],
        datasets: [
            {
                data: [chamadosPorPrioridade.Baixa, chamadosPorPrioridade.Média, chamadosPorPrioridade.Alta],
                backgroundColor: ['#4CAF50', '#FF9800', '#F44336'], // Verde, Laranja, Vermelho
                hoverBackgroundColor: ['#66BB6A', '#FFB74D', '#EF5350'],
            },
        ],
    };

    // Dados para o gráfico de barras (Chamados por Status)
    const dataBarras = {
        labels: ['Aberto', 'Em Atendimento', 'Fechado'],
        datasets: [
            {
                label: 'Chamados',
                data: [chamadosPorStatus.Aberto, chamadosPorStatus.EmAtendimento, chamadosPorStatus.Fechado],
                backgroundColor: ['#4CAF50','#FFC107', '#FF5252' ], // Verde, Vermelho, Amarelo
            },
        ],
    };

    if (loadingEquipments || loadingChamados) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Conteúdo Principal */}
            <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5' }}>
                    Dashboard de Gestão de Ordens de Serviço
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid2 container spacing={3}>
                    {/* Total de Chamados Abertos */}
                    <Grid2 xs={12} md={6} lg={3}>
                        
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Total de Equipamentos
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#3f51b5' }}>
                                {totalEquipamentos}
                            </Typography>
                            <Divider />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados Abertos
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#3f51b5' }}>
                                {totalChamadosAbertos}
                            </Typography>
                            <Divider />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados em Atendimento
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#3f51b5' }}>
                                {totalChamadosEmAtendimento}
                            </Typography>
                            <Divider />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados Fechados
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#3f51b5' }}>
                                {totalChamadosFechados}
                            </Typography>
                        </Paper>
                    </Grid2>

                    {/* Gráfico de Pizza: Chamados por Prioridade */}
                    <Grid2 xs={12} md={6} lg={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados por Prioridade
                            </Typography>
                            <Divider />
                            <Box sx={{ mt: 2, height: '300px' }}>
                                <Doughnut data={dataPizza} />
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Gráfico de Barras: Chamados por Status */}
                    <Grid2 xs={12} md={6} lg={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados por Status
                            </Typography>
                            <Divider />
                            <Box sx={{ mt: 2, height: '300px' }}>
                                <Bar data={dataBarras} />
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Gráfico de Linhas: Chamados Abertos nos Últimos 30 Dias */}
                    <Grid2 xs={12}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Chamados Abertos nos Últimos 30 Dias
                            </Typography>
                            <Divider />
                            <Box sx={{ mt: 2, height: '300px' }}>
                                <Line data={dataLinhas} />
                            </Box>
                        </Paper>
                    </Grid2>

                    {/* Últimos Chamados Registrados */}
                    <Grid2 xs={12} md={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                Últimos Chamados Registrados
                            </Typography>
                            <Divider />
                            <Box sx={{ mt: 1 }}>
                                {ultimosChamados.map((chamado) => (
                                    <Box key={chamado.id} sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography>
                                            <strong>{chamado.titulo}</strong> - {chamado.status}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {chamado.equipamento} - {format(chamado.createdAt.toDate(), 'dd/MM/yyyy HH:mm')}
                                        </Typography>
                                        <Divider />
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid2>
                </Grid2>
            </Box>
        </Box>
    );
};

export default Dashboard;