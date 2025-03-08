import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Button,
  Grid2,
} from '@mui/material';

import { useEquipments } from '../hooks/useEquipments'; // Hook para equipamentos
import { useChamados } from '../hooks/useChamados'; // Hook para chamados
import { useUsers } from '../hooks/useUsers'; // Hook para usuários
import { Pie, Bar, Line } from 'react-chartjs-2'; // Gráficos
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { format, subDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext'; // Contexto de autenticação
import { useNavigate } from 'react-router-dom'; // Para redirecionamento
import Sidebar from '../components/shared/Sidebar'; // Componente Sidebar
import { enqueueSnackbar, useSnackbar } from 'notistack';

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
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const { currentUser } = useAuth(); // Obtém o usuário logado
  const navigate = useNavigate(); // Para redirecionamento
  const { equipments, loading: loadingEquipments } = useEquipments();
  const { chamados, loading: loadingChamados } = useChamados();
  const { users, loading: loadingUsers } = useUsers(); // Dados dos usuários
  const [chamadosData, setChamadosData] = useState([]);
  const hoje = new Date();

  // Estados para controlar a exibição de "Ver mais"
  const [showMoreSetores, setShowMoreSetores] = useState(false);
  const [showMoreChamadosComDemora, setShowMoreChamadosComDemora] = useState(false);

  // Verificação de login e role
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        enqueueSnackbar('Você está acessando a dashboard um dispositivo móvel. Recursos podem não funcionar corretamente. Você será direcionado.', { variant: 'warning' });
        navigate('/home');
    }

    if (!currentUser) {
      navigate('/login'); // Redireciona para a página de login se o usuário não estiver logado
    } else if (currentUser.role !== 'admin') {
      navigate('/home'); // Redireciona para uma página de acesso negado
    }
  }, [currentUser, navigate]);
    // **Setores com mais chamados nos últimos 30 dias**
  const chamadosPorSetor = chamadosData.reduce((acc, chamado) => {
    const dataChamado = chamado.createdAt.toDate();
    const dentroDosUltimos30Dias = dataChamado >= subDays(hoje, 30);

    if (dentroDosUltimos30Dias) {
      acc[chamado.setor] = (acc[chamado.setor] || 0) + 1;
    }
    return acc;
  }, {});

  // Carrega os chamados em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chamados'), (snapshot) => {
      const chamadosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChamadosData(chamadosData);
    });

    return () => unsubscribe();
  }, []);

  // Funções para calcular os dados do dashboard
  const totalEquipamentos = equipments.length;
  const totalChamadosAbertos = chamadosData.filter(chamado => chamado.status === 'Aberto').length;
  const totalChamadosEmAtendimento = chamadosData.filter(chamado => chamado.status === 'Em Atendimento').length;
  const totalChamadosFechados = chamadosData.filter(chamado => chamado.status === 'Fechado').length;

  // Dados para gráficos
  const chamadosPorPrioridade = {
    Baixa: chamadosData.filter(chamado => chamado.prioridade === 'Baixa').length,
    Média: chamadosData.filter(chamado => chamado.prioridade === 'Média').length,
    Alta: chamadosData.filter(chamado => chamado.prioridade === 'Alta').length,
  };

  const chamadosPorStatus = {
    Aberto: chamadosData.filter(chamado => chamado.status === 'Aberto').length,
    EmAtendimento: chamadosData.filter(chamado => chamado.status === 'Em Atendimento').length,
    Fechado: chamadosData.filter(chamado => chamado.status === 'Fechado').length,
  };

  const dataPizzaSetores = {
    labels: Object.keys(chamadosPorSetor),
    datasets: [
      {
        data: Object.values(chamadosPorSetor),
        backgroundColor: [
          '#8E44AD', // Roxo
          '#2980B9', // Azul
          '#27AE60', // Verde
          '#F39C12', // Amarelo
          '#D35400', // Laranja
        ],
        hoverBackgroundColor: [
          '#9B59B6', // Roxo claro
          '#3498DB', // Azul claro
          '#2ECC71', // Verde claro
          '#F1C40F', // Amarelo claro
          '#E67E22', // Laranja claro
        ],
      },
    ],
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
  const ultimosChamados = chamadosData
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  // Gráfico de linhas: Total de chamados abertos nos últimos 30 dias
  const getChamadosAbertosUltimos30Dias = () => {
    const hoje = new Date();
    const dias = Array.from({ length: 30 }, (_, i) => subDays(hoje, i)).reverse(); // Últimos 30 dias

    const chamadosPorDia = dias.map(dia => {
      const chamadosNoDia = chamadosData.filter(chamado => {
        const dataChamado = chamado.createdAt.toDate();
        return (
          dataChamado.getDate() === dia.getDate() &&
          dataChamado.getMonth() === dia.getMonth() &&
          dataChamado.getFullYear() === dia.getFullYear() 
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

  const chamadosPorTecnico = users.reduce((acc, user) => {
    const chamadosAtendidos = chamadosData.filter(chamado => {
      const dataChamado = chamado.createdAt.toDate();
      const dentroDosUltimos30Dias = dataChamado >= subDays(hoje, 30);
  
      return dentroDosUltimos30Dias && chamado.atendentes?.some(att => att.uid === user.uid);
    });
  
    if (chamadosAtendidos.length > 0) {  // Verifica se o técnico tem chamados atendidos nos últimos 30 dias
      acc[`${user.displayName} (${user.username})`] = chamadosAtendidos.length; // Combina displayName e username
    }
    return acc;
  }, {});
  
  const dataBarrasChamadosPorTecnico = {
    labels: Object.keys(chamadosPorTecnico), // Já contém displayName e username
    datasets: [
      {
        label: 'Chamados Atendidos (Últimos 30 Dias)',
        data: Object.values(chamadosPorTecnico),
        backgroundColor: '#3f51b5', // Cor azul
      },
    ],
  };



  const setoresComMaisChamados = Object.keys(chamadosPorSetor).map(setor => ({
    setor,
    quantidade: chamadosPorSetor[setor],
  })).sort((a, b) => b.quantidade - a.quantidade);

  // **Chamados que estão demorando mais para ter técnicos atribuídos**
  const chamadosComDemora = chamadosData
    .filter(chamado => chamado.status === 'Aberto' && !chamado.atendentes?.length)
    .sort((a, b) => {
      const tempoA = (new Date() - a.createdAt.toDate());
      const tempoB = (new Date() - b.createdAt.toDate());
      return tempoB - tempoA; // Maior tempo de espera primeiro
    });

  if (loadingEquipments || loadingChamados || loadingUsers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      <Box sx={{ flex: 1, marginLeft: { xs: 0, md: 30 }, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5' }}>
          Dashboard de Gestão de Ordens de Serviço
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Dados gerais */}
        <Grid2 container spacing={3}>
          {/* Total de Chamados */}
          <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Total de Chamados</Typography>
              <Typography variant="h4" sx={{ mt: 1, color: '#3f51b5' }}>{chamadosData.length}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ color: '#3f51b5' }}>Abertos: {totalChamadosAbertos}</Typography>
              <Typography variant="subtitle1" sx={{ color: '#3f51b5' }}>Em Atendimento: {totalChamadosEmAtendimento}</Typography>
              <Typography variant="subtitle1" sx={{ color: '#3f51b5' }}>Fechados: {totalChamadosFechados}</Typography>
            </Paper>
          </Grid2>

          {/* Setores com mais chamados */}
          <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Setores com mais Chamados</Typography>
              <Divider />
              <Box sx={{ mt: 2, flex: 1, overflow: 'auto' }}>
                {(showMoreSetores ? setoresComMaisChamados : setoresComMaisChamados.slice(0, 3)).map(setor => (
                  <Typography key={setor.setor} sx={{ color: '#3f51b5' }}>
                    {setor.setor}: {setor.quantidade} chamados
                  </Typography>
                ))}
              </Box>
              {setoresComMaisChamados.length > 3 && (
                <Button onClick={() => setShowMoreSetores(!showMoreSetores)} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                  {showMoreSetores ? 'Ver menos' : 'Ver mais'}
                </Button>
              )}
            </Paper>
          </Grid2>

          {/* Chamados com demora para atribuição */}
          <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                Chamados a serem atendidos:
              </Typography>
              <Divider />
              <Box sx={{ mt: 2, flex: 1, overflow: 'auto' }}>
                {(showMoreChamadosComDemora ? chamadosComDemora : chamadosComDemora.slice(0, 3)).map(chamado => (
                  <Typography key={chamado.id} sx={{ color: '#3f51b5' }}>
                    {chamado.titulo} - {format(chamado.createdAt.toDate(), 'dd/MM/yyyy')}
                  </Typography>
                ))}
              </Box>
              {chamadosComDemora.length > 3 && (
                <Button onClick={() => setShowMoreChamadosComDemora(!showMoreChamadosComDemora)} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                  {showMoreChamadosComDemora ? 'Ver menos' : 'Ver mais'}
                </Button>
              )}
            </Paper>
          </Grid2>
        </Grid2>
        
        <Grid2 container spacing={3} sx={{ mt: 3 }}>
                  {/* Gráficos */}
        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Chamados por Prioridade</Typography>
              <Box sx={{ mt: 2, height: '300px' }}>
                <Pie data={dataPizza} />
              </Box>
            </Paper>
          </Grid2>

          <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Chamados por Setor</Typography>
              <Box sx={{ mt: 2, height: '300px' }}>
                <Pie data={dataPizzaSetores} />
              </Box>
            </Paper>
        </Grid2>
        </Grid2>

        <Grid2 container spacing={3} sx={{ mt: 3 }}>
        <Grid2 xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Chamados por Status</Typography>
              <Box sx={{ mt: 2, height: '300px' }}>
                <Bar data={dataBarras} />
              </Box>
            </Paper>
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Chamados Atendidos por Técnico</Typography>
              <Box sx={{ mt: 2, height: '300px' }}>
                <Bar data={dataBarrasChamadosPorTecnico} />
              </Box>
            </Paper>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={3} sx={{ mt: 3, width: '100%' }}>
          <Grid2 item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                Chamados Abertos nos Últimos 30 Dias
              </Typography>
              <Box sx={{ mt: 2, height: '300px' }}>
                <Line data={dataLinhas} />
              </Box>
            </Paper>
          </Grid2>
        </Grid2>

      </Grid2>

      </Box>
    </Box>
  );
};

export default Dashboard;