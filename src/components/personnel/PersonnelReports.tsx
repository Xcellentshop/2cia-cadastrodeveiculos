import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import { FileText, Download, BarChart } from 'lucide-react';
import { format } from 'date-fns';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels
);

interface Personnel {
  id?: string;
  rank: string;
  name: string;
  rg: string;
  phone: string;
  city: string;
  platoon: string;
  sector: string;
}

export default function PersonnelReports() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCharts, setShowCharts] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const chartColors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: '#fff',
        formatter: (value: number, ctx: any) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value * 100) / total).toFixed(1);
          return `${value}\n(${percentage}%)`;
        }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      console.log('Fetching personnel data...');
      const querySnapshot = await getDocs(collection(db, 'personnel'));
      const personnelData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Personnel[];
      console.log('Personnel data fetched:', personnelData);
      setPersonnel(personnelData);
    } catch (error) {
      console.error('Error fetching personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPersonnel = () => {
    console.log('Filtering personnel:', personnel);
    return personnel.filter(person => {
      const matchesSector = !selectedSector || person.sector === selectedSector;
      const matchesRank = !selectedRank || person.rank === selectedRank;
      const matchesCity = !selectedCity || person.city === selectedCity;
      return matchesSector && matchesRank && matchesCity;
    });
  };

  const generateStats = (filteredPersonnel: Personnel[]) => {
    const stats = {
      total: filteredPersonnel.length,
      bySector: {} as Record<string, number>,
      byRank: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      byPlatoon: {} as Record<string, number>
    };

    filteredPersonnel.forEach(person => {
      // Por setor
      stats.bySector[person.sector] = (stats.bySector[person.sector] || 0) + 1;
      
      // Por posto/graduação
      stats.byRank[person.rank] = (stats.byRank[person.rank] || 0) + 1;
      
      // Por cidade
      stats.byCity[person.city] = (stats.byCity[person.city] || 0) + 1;
      
      // Por pelotão
      if (person.platoon) {
        stats.byPlatoon[person.platoon] = (stats.byPlatoon[person.platoon] || 0) + 1;
      }
    });

    return stats;
  };

  const generateChartData = (stats: ReturnType<typeof generateStats>) => {
    const sectorData = {
      labels: Object.keys(stats.bySector),
      datasets: [{
        data: Object.values(stats.bySector),
        backgroundColor: chartColors.slice(0, Object.keys(stats.bySector).length),
        borderWidth: 1
      }]
    };

    const rankData = {
      labels: Object.keys(stats.byRank),
      datasets: [{
        data: Object.values(stats.byRank),
        backgroundColor: chartColors.slice(0, Object.keys(stats.byRank).length),
        borderWidth: 1
      }]
    };

    const cityData = {
      labels: Object.keys(stats.byCity),
      datasets: [{
        data: Object.values(stats.byCity),
        backgroundColor: chartColors.slice(0, Object.keys(stats.byCity).length),
        borderWidth: 1
      }]
    };

    const platoonData = {
      labels: Object.keys(stats.byPlatoon),
      datasets: [{
        data: Object.values(stats.byPlatoon),
        backgroundColor: chartColors.slice(0, Object.keys(stats.byPlatoon).length),
        borderWidth: 1
      }]
    };

    return { sectorData, rankData, cityData, platoonData };
  };

  const exportChartsToPNG = async () => {
    if (!chartsRef.current) return;

    try {
      const canvas = await html2canvas(chartsRef.current);
      const link = document.createElement('a');
      link.download = 'graficos-efetivo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting charts:', error);
    }
  };

  const exportToPDF = (filteredPersonnel: Personnel[]) => {
    const doc = new jsPDF();
    const stats = generateStats(filteredPersonnel);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPos = margin;
    const lineHeight = 7;

    // Função auxiliar para calcular porcentagem
    const calculatePercentage = (value: number, total: number) => {
      return ((value * 100) / total).toFixed(1);
    };

    // Título
    doc.setFontSize(16);
    doc.text('Relatório do Efetivo Policial', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Data do relatório
    doc.setFontSize(10);
    doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, yPos);
    yPos += lineHeight * 2;

    // Resumo Geral
    doc.setFontSize(14);
    doc.text('Resumo Geral', margin, yPos);
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.text(`Total de Policiais: ${stats.total}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Número de Setores: ${Object.keys(stats.bySector).length}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Número de Cidades: ${Object.keys(stats.byCity).length}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Número de Postos/Graduações: ${Object.keys(stats.byRank).length}`, margin, yPos);
    yPos += lineHeight * 2;

    // Distribuição por Setor
    doc.setFontSize(14);
    doc.text('Distribuição por Setor', margin, yPos);
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    Object.entries(stats.bySector).forEach(([sector, count]) => {
      const percentage = calculatePercentage(count, stats.total);
      doc.text(`${sector}: ${count} (${percentage}%)`, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Distribuição por Posto/Graduação
    doc.setFontSize(14);
    doc.text('Distribuição por Posto/Graduação', margin, yPos);
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    Object.entries(stats.byRank).forEach(([rank, count]) => {
      const percentage = calculatePercentage(count, stats.total);
      doc.text(`${rank}: ${count} (${percentage}%)`, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Distribuição por Cidade
    doc.setFontSize(14);
    doc.text('Distribuição por Cidade', margin, yPos);
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    Object.entries(stats.byCity).forEach(([city, count]) => {
      const percentage = calculatePercentage(count, stats.total);
      doc.text(`${city}: ${count} (${percentage}%)`, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Distribuição por Pelotão
    doc.setFontSize(14);
    doc.text('Distribuição por Pelotão', margin, yPos);
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    Object.entries(stats.byPlatoon).forEach(([platoon, count]) => {
      const percentage = calculatePercentage(count, stats.total);
      doc.text(`${platoon}: ${count} (${percentage}%)`, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Lista detalhada
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Lista Detalhada do Efetivo', margin, margin);

    (doc as any).autoTable({
      startY: margin + 10,
      head: [['Posto/Grad.', 'Nome', 'RG', 'Telefone', 'Cidade', 'Setor', 'Pelotão']],
      body: filteredPersonnel.map(person => [
        person.rank,
        person.name,
        person.rg,
        person.phone,
        person.city,
        person.sector,
        person.platoon
      ]),
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Posto/Grad.
        1: { cellWidth: 40 }, // Nome
        2: { cellWidth: 20 }, // RG
        3: { cellWidth: 25 }, // Telefone
        4: { cellWidth: 25 }, // Cidade
        5: { cellWidth: 30 }, // Setor
        6: { cellWidth: 20 }  // Pelotão
      },
      theme: 'grid'
    });

    doc.save('relatorio-efetivo.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Relatório do Efetivo
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => exportToPDF(filterPersonnel())}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <FileText className="h-5 w-5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <BarChart className="h-5 w-5" />
            <span>{showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total de Policiais</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{personnel.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Setores</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {Object.keys(generateStats(personnel).bySector).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Cidades</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {Object.keys(generateStats(personnel).byCity).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Postos/Graduações</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {Object.keys(generateStats(personnel).byRank).length}
          </p>
        </div>
      </div>

      {showCharts && (
        <div ref={chartsRef} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição por Setor</h3>
              <div className="h-64">
                <Pie data={generateChartData(generateStats(personnel)).sectorData} options={chartConfig} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição por Posto/Graduação</h3>
              <div className="h-64">
                <Pie data={generateChartData(generateStats(personnel)).rankData} options={chartConfig} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição por Cidade</h3>
              <div className="h-64">
                <Pie data={generateChartData(generateStats(personnel)).cityData} options={chartConfig} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição por Pelotão</h3>
              <div className="h-64">
                <Pie data={generateChartData(generateStats(personnel)).platoonData} options={chartConfig} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
