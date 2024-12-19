import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MedicalLeave } from '../../types/medical';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function MedicalLeaveReports() {
  const [medicalLeaves, setMedicalLeaves] = useState<MedicalLeave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalLeaves();
  }, []);

  const fetchMedicalLeaves = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'medical-leaves'));
      const leaves = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MedicalLeave[];
      setMedicalLeaves(leaves);
    } catch (error) {
      console.error('Error fetching medical leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const brasiliaOffset = -3; // UTC-3
    now.setHours(now.getHours() + brasiliaOffset);

    // Separar afastamentos ativos (incluindo indeterminados) e retornados
    const activeLeaves = medicalLeaves.filter(leave => 
      leave.isIndeterminate || (leave.endDate && new Date(leave.endDate) >= now)
    );
    const returnedLeaves = medicalLeaves.filter(leave => 
      !leave.isIndeterminate && leave.endDate && new Date(leave.endDate) < now
    );

    const totalLeaves = medicalLeaves.length;
    const activePercentage = (activeLeaves.length / totalLeaves) * 100 || 0;
    const returnedPercentage = (returnedLeaves.length / totalLeaves) * 100 || 0;

    // Title
    doc.setFontSize(16);
    doc.text('Relatório de Licenças Médicas', 14, 20);

    // Summary
    doc.setFontSize(12);
    doc.text('Resumo:', 14, 30);
    doc.text(`Total de Licenças: ${totalLeaves}`, 14, 40);
    doc.text(`Em Andamento: ${activeLeaves.length} (${activePercentage.toFixed(1)}%)`, 14, 50);
    doc.text(`Retornados: ${returnedLeaves.length} (${returnedPercentage.toFixed(1)}%)`, 14, 60);

    // Active Leaves Table
    doc.text('Licenças em Andamento:', 14, 80);
    doc.autoTable({
      startY: 85,
      head: [['Posto/Grad', 'Nome Guerra', 'CID', 'Início', 'Término']],
      body: activeLeaves.map(leave => [
        leave.rank,
        leave.warName,
        leave.cid || '-',
        format(new Date(leave.startDate), 'dd/MM/yyyy'),
        leave.isIndeterminate ? 'Indeterminado' : format(new Date(leave.endDate!), 'dd/MM/yyyy')
      ]),
    });

    // Returned Leaves Table
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('Policiais que Retornaram:', 14, finalY);
    doc.autoTable({
      startY: finalY + 5,
      head: [['Posto/Grad', 'Nome Guerra', 'CID', 'Início', 'Término']],
      body: returnedLeaves.map(leave => [
        leave.rank,
        leave.warName,
        leave.cid || '-',
        format(new Date(leave.startDate), 'dd/MM/yyyy'),
        format(new Date(leave.endDate!), 'dd/MM/yyyy')
      ]),
    });

    doc.save('relatorio-licencas-medicas.pdf');
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Relatórios</h2>
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            <FileText className="h-5 w-5" />
            <span>Gerar PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total de Licenças</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {medicalLeaves.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Em Andamento</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {medicalLeaves.filter(leave => leave.isIndeterminate || (leave.endDate && new Date(leave.endDate) >= new Date())).length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Retornados</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {medicalLeaves.filter(leave => !leave.isIndeterminate && leave.endDate && new Date(leave.endDate) < new Date()).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}