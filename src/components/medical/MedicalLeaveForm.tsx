import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MedicalLeave, Rank, LeaveType } from '../../types/medical';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const RANKS: Rank[] = [
  'Soldado 2ª Classe',
  'Soldado 1ª Classe',
  'Cabo',
  '1º Sargento',
  '2º Sargento',
  '3º Sargento',
  '4º Sargento',
  '1º Tenente',
  '2º Tenente',
  'Capitão',
  'Major',
  'Tenente-Coronel',
  'Coronel'
];

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'medical', label: 'Licença Médica' },
  { value: 'special', label: 'Licença Especial' },
  { value: 'training', label: 'Licença Capacitação' },
  { value: 'attached', label: 'Adido' },
  { value: 'judicial', label: 'Afastado Judicialmente' },
  { value: 'vacation', label: 'Férias' },
  { value: 'course', label: 'Em Curso' }
];

export default function MedicalLeaveForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '' as LeaveType | '',
    rank: '',
    warName: '',
    cid: '',
    observation: '',
    startDate: '',
    endDate: '',
    isIndeterminate: false
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchMedicalLeave();
    }
  }, [id]);

  const fetchMedicalLeave = async () => {
    try {
      const docRef = await getDoc(doc(db, 'medical-leaves', id!));
      if (docRef.exists()) {
        const data = docRef.data() as MedicalLeave;
        setFormData({
          leaveType: data.leaveType,
          rank: data.rank,
          warName: data.warName,
          cid: data.cid || '',
          observation: data.observation || '',
          startDate: data.startDate.split('T')[0],
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          isIndeterminate: data.isIndeterminate
        });
      }
    } catch (error) {
      console.error('Error fetching medical leave:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDate = new Date(formData.startDate);
      startDate.setUTCHours(12);

      // Remove endDate do objeto base para evitar dados residuais
      const { endDate: _, ...baseData } = formData;

      const medicalLeaveData = {
        ...baseData,
        startDate: startDate.toISOString(),
        // Apenas inclui endDate se não for indeterminado e tiver uma data
        ...(formData.isIndeterminate ? {} : {
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        }),
        status: 'active' as const
      };

      if (isEditing) {
        await updateDoc(doc(db, 'medical-leaves', id!), {
          ...medicalLeaveData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Registro atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'medical-leaves'), {
          ...medicalLeaveData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Registro cadastrado com sucesso!');
      }
      navigate('/medical-leave');
    } catch (error) {
      console.error('Error saving medical leave:', error);
      toast.error('Erro ao salvar registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? 'Editar Afastamento' : 'Cadastrar Afastamento'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Afastamento
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
          >
            <option value="">Selecione o tipo de afastamento</option>
            {LEAVE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Posto/Graduação
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
          >
            <option value="">Selecione o posto/graduação</option>
            {RANKS.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome de Guerra
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.warName}
            onChange={(e) => setFormData({ ...formData, warName: e.target.value })}
          />
        </div>

        {formData.leaveType === 'medical' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CID
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.cid}
              onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observação
            </label>
            <textarea
              required
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              rows={3}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              required
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Final
            </label>
            <div className="space-y-2">
              <input
                type="date"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.isIndeterminate}
                required={!formData.isIndeterminate}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isIndeterminate"
                  className="mr-2"
                  checked={formData.isIndeterminate}
                  onChange={(e) => setFormData({ ...formData, isIndeterminate: e.target.checked, endDate: '' })}
                />
                <label htmlFor="isIndeterminate" className="text-sm text-gray-700 dark:text-gray-300">
                  Indeterminado
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar Afastamento' : 'Cadastrar Afastamento')}
        </button>
      </div>
    </form>
  );
}