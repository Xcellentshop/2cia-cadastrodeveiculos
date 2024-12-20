import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MedicalLeave, LeaveType } from '../../types/medical';
import { format, differenceInDays } from 'date-fns';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

export default function MedicalLeaveList() {
  const [activeLeaves, setActiveLeaves] = useState<MedicalLeave[]>([]);
  const [returnedLeaves, setReturnedLeaves] = useState<MedicalLeave[]>([]);
  const navigate = useNavigate();

  // Função para carregar os dados do Firestore
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const q = query(collection(db, 'medical-leaves'));
        const querySnapshot = await getDocs(q);

        const active: MedicalLeave[] = [];
        const returned: MedicalLeave[] = [];
        const now = new Date();
        const brasiliaOffset = -3; // UTC-3
        now.setHours(now.getHours() + brasiliaOffset);

        querySnapshot.forEach((doc) => {
          const data = doc.data() as MedicalLeave;
          const leave = { id: doc.id, ...data };
          
          // Se for indeterminado OU se tiver data final e ainda não passou, está ativo
          if (leave.isIndeterminate) {
            active.push(leave);
          } else if (leave.endDate) {
            const endDate = new Date(leave.endDate);
            endDate.setHours(23, 59, 59, 999);
            
            if (endDate >= now) {
              active.push(leave);
            } else {
              returned.push(leave);
            }
          } else {
            // Se não tem data final e não é indeterminado, considera ativo
            active.push(leave);
          }
        });

        // Ordenar por data de retorno (endDate)
        active.sort((a, b) => {
          if (a.isIndeterminate) return -1;
          if (b.isIndeterminate) return 1;
          if (!a.endDate || !b.endDate) return 0;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });

        returned.sort((a, b) => {
          if (!a.endDate || !b.endDate) return 0;
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        });

        setActiveLeaves(active);
        setReturnedLeaves(returned);
      } catch (error) {
        toast.error('Erro ao carregar os dados.');
        console.error(error);
      }
    };

    fetchLeaves();
  }, []);

  // Função para excluir um registro
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteDoc(doc(db, 'medical-leaves', id));
        toast.success('Registro excluído com sucesso.');
        setActiveLeaves((prev) => prev.filter((leave) => leave.id !== id));
        setReturnedLeaves((prev) => prev.filter((leave) => leave.id !== id));
      } catch (error) {
        toast.error('Erro ao excluir o registro.');
        console.error(error);
      }
    }
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    const labels: Record<LeaveType, string> = {
      medical: 'Licença Médica',
      special: 'Licença Especial',
      training: 'Licença Capacitação',
      attached: 'Adido',
      judicial: 'Afastado Judicialmente',
      vacation: 'Férias',
      course: 'Em Curso'
    };
    return labels[type];
  };

  // Função para agrupar os afastamentos ativos por tipo
  const groupActiveLeavesByType = () => {
    const groups = {
      medical: [] as MedicalLeave[],
      special: [] as MedicalLeave[],
      training: [] as MedicalLeave[],
      attached: [] as MedicalLeave[],
      judicial: [] as MedicalLeave[],
      vacation: [] as MedicalLeave[],
      course: [] as MedicalLeave[]
    };

    activeLeaves.forEach(leave => {
      if (leave.leaveType && groups[leave.leaveType]) {
        groups[leave.leaveType].push(leave);
      }
    });

    return groups;
  };

  const activeLeavesByType = groupActiveLeavesByType();

  // Ordenar tipos por quantidade de policiais (exceto retornados)
  const sortedLeaveTypes = Object.entries(activeLeavesByType)
    .filter(([type, leaves]) => leaves.length > 0)
    .sort(([typeA, leavesA], [typeB, leavesB]) => leavesB.length - leavesA.length);

  // Função para renderizar cada cartão de licença
  const renderLeaveCard = (leave: MedicalLeave) => {
    const startDate = new Date(leave.startDate);
    const endDate = leave.endDate ? new Date(leave.endDate) : null;
    
    // Configurar data atual no fuso horário de Brasília
    const now = new Date();
    const brasiliaOffset = -3; // UTC-3
    now.setHours(now.getHours() + brasiliaOffset);
    
    // Ajustar para o final do dia (23:59:59)
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Calcular dias restantes apenas se não for indeterminado e tiver data final
    const daysLeft = !leave.isIndeterminate && endDate ? 
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 
      null;

    return (
      <div
        key={leave.id}
        className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              {leave.rank} {leave.warName}
            </h4>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {leave.leaveType === 'medical' ? `CID: ${leave.cid}` : getLeaveTypeLabel(leave.leaveType)}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Início: {format(startDate, 'dd/MM/yyyy')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Fim: {leave.isIndeterminate ? 'Indeterminado' : (endDate ? format(endDate, 'dd/MM/yyyy') : 'Não definido')}
            </p>
            {leave.observation && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Observação: {leave.observation}
              </p>
            )}
            {!leave.isIndeterminate && daysLeft !== null && (
              <p className={`text-sm font-medium ${daysLeft > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'}`}>
                {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Apto ao trabalho'}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => navigate(`/medical-leave/edit/${leave.id}`)}
            className="text-blue-500 hover:text-blue-700 transition"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(leave.id)}
            className="text-red-500 hover:text-red-700 transition"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gerenciamento de policiais em licença médica, especial, afastados, etc..
        </h2>
        <Link
          to="/medical-leave/new"
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Novo Afastamento</span>
        </Link>
      </div>

      {/* Exibir categorias ativas ordenadas por quantidade */}
      {sortedLeaveTypes.map(([type, leaves]) => (
        <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {getLeaveTypeLabel(type as LeaveType)} ({leaves.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaves.map(renderLeaveCard)}
          </div>
        </div>
      ))}

      {/* Exibir policiais que retornaram sempre por último */}
      {returnedLeaves.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Policiais que Retornaram ({returnedLeaves.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {returnedLeaves.map(renderLeaveCard)}
          </div>
        </div>
      )}
    </div>
  );
}
