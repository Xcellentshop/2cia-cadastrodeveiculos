import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Personnel, Rank, City, Sector, Platoon } from '../../types/personnel';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const RANKS: Rank[] = [
  'Soldado 2ª Classe',
  'Soldado 1ª Classe',
  'Cabo',
  '3º Sargento',
  '2º Sargento',
  '1º Sargento',
  'Subtenente',
  'Aspirante a Oficial',
  '2º Tenente',
  '1º Tenente',
  'Capitão',
  'Major',
  'Tenente-Coronel',
  'Coronel'
];

const CITIES: City[] = ['Medianeira', 'Missal', 'SMI', 'Itaipulândia', 'Serranópolis'];

const SECTORS: Sector[] = [
  'COMANDO', 'SUBCOMANDO', 'ADM', 'ROTAM', 'RPA', 'COPOM', 
  'P2', 'RURAL', 'ATESTADO', 'LICENÇA', 'FERIAS', 'JUDICE', 'ADC'
];

const PLATOONS: Platoon[] = ['1º Pelotão', '2º Pelotão', 'Não Pertence'];

interface SavedPersonnel {
  name: string;
  rg: string;
  phone: string;
}

export default function PersonnelForm() {
  const [loading, setLoading] = useState(false);
  const [savedPersonnel, setSavedPersonnel] = useState<SavedPersonnel[]>([]);
  const [formData, setFormData] = useState({
    rank: '' as Rank,
    name: '',
    rg: '',
    phone: '',
    city: '' as City,
    platoon: '' as Platoon,
    sector: '' as Sector
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchPersonnel();
    }
    fetchSavedPersonnel();
  }, [id]);

  const fetchSavedPersonnel = async () => {
    try {
      const personnelRef = collection(db, 'personnel');
      const snapshot = await getDocs(personnelRef);
      const saved = snapshot.docs.map(doc => ({
        name: doc.data().name,
        rg: doc.data().rg,
        phone: doc.data().phone
      }));
      setSavedPersonnel(saved);
    } catch (error) {
      console.error('Error fetching saved personnel:', error);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const personnelDoc = await getDoc(doc(db, 'personnel', id!));
      if (personnelDoc.exists()) {
        const data = personnelDoc.data() as Personnel;
        setFormData({
          rank: data.rank,
          name: data.name,
          rg: data.rg,
          phone: data.phone,
          city: data.city,
          platoon: data.platoon,
          sector: data.sector
        });
      }
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const savedPerson = savedPersonnel.find(p => p.name === name);
      if (savedPerson) {
        return {
          ...prev,
          name,
          rg: savedPerson.rg,
          phone: savedPerson.phone
        };
      }
      return {
        ...prev,
        name
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'personnel', id!), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Policial atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'personnel'), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Policial cadastrado com sucesso!');
      }
      navigate('/personnel');
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? 'Editar Policial' : 'Cadastrar Policial'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Posto/Graduação
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value as Rank })}
          >
            <option value="">Selecione o posto/graduação</option>
            {RANKS.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome
          </label>
          <input
            type="text"
            required
            list="saved-names"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <datalist id="saved-names">
            {savedPersonnel.map((person, index) => (
              <option key={index} value={person.name} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            RG
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cidade
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value as City })}
          >
            <option value="">Selecione a cidade</option>
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pelotão
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.platoon}
            onChange={(e) => setFormData({ ...formData, platoon: e.target.value as Platoon })}
          >
            <option value="">Selecione o pelotão</option>
            {PLATOONS.map(platoon => (
              <option key={platoon} value={platoon}>{platoon}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Setor
          </label>
          <select
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
          >
            <option value="">Selecione o setor</option>
            {SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar Policial' : 'Cadastrar Policial')}
        </button>
      </div>
    </form>
  );
}