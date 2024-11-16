import React, { createContext, useContext, useState, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwGoBJngOSH7b7u9gLuBHabw61kbcUi0g",
  authDomain: "escala-2cia.firebaseapp.com",
  projectId: "escala-2cia",
  storageBucket: "escala-2cia.firebasestorage.app",
  messagingSenderId: "784079968523",
  appId: "1:784079968523:web:b22e733f7c5f115e7e6a0e",
  measurementId: "G-VBVLX084JF"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface ChatContextType {
  messages: { user: string; text: string }[];
  sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);

  // Função para consultar informações no Firestore e gerar resposta
  const fetchVehicleData = async (queryText: string) => {
    try {
      const normalizedQuery = queryText.toLowerCase();
      const vehiclesRef = collection(db, "vehicles");

      // Verificar se a pergunta é sobre a quantidade de veículos
      if (normalizedQuery.includes("quantos veículos")) {
        // Verificar ano e cidade
        const matchCity = normalizedQuery.match(/em\s(\w+)/);
        const matchYear = normalizedQuery.match(/ano\s(\d{4})/);
        const city = matchCity ? matchCity[1] : null;
        const year = matchYear ? matchYear[1] : null;

        let vehicleQuery = vehiclesRef;
        if (city) vehicleQuery = query(vehicleQuery, where("city", "==", city));
        if (year) vehicleQuery = query(vehicleQuery, where("releaseDate", ">=", `${year}-01-01`), where("releaseDate", "<=", `${year}-12-31`));

        const querySnapshot = await getDocs(vehicleQuery);
        const count = querySnapshot.size;
        return `Existem ${count} veículos cadastrados ${city ? `em ${city}` : ""} ${year ? `no ano ${year}` : ""}.`;
      }

      // Filtragem por correspondência parcial de placa ou outras variáveis
      const querySnapshot = await getDocs(vehiclesRef);
      const vehicles = querySnapshot.docs.map((doc) => doc.data());

      const foundVehicles = vehicles.filter((vehicle: any) => 
        vehicle.plate.toLowerCase().includes(normalizedQuery) || // Busca por placa
        vehicle.brand.toLowerCase().includes(normalizedQuery) || // Busca por marca
        vehicle.model.toLowerCase().includes(normalizedQuery) || // Busca por modelo
        vehicle.state.toLowerCase().includes(normalizedQuery) || // Busca por estado
        vehicle.city.toLowerCase().includes(normalizedQuery) || // Busca por cidade
        vehicle.vehicleType.toLowerCase().includes(normalizedQuery) // Busca por tipo de veículo
      );

      if (foundVehicles.length > 0) {
        return foundVehicles
          .map((vehicle: any) => `Veículo encontrado: Marca: ${vehicle.brand}, Modelo: ${vehicle.model}, Placa: ${vehicle.plate}, Cidade: ${vehicle.city}, Estado: ${vehicle.state}, Tipo: ${vehicle.vehicleType}, Ano de Lançamento: ${vehicle.releaseDate}`)
          .join("\n");
      } else {
        return 'Desculpe, não encontrei informações sobre esse veículo.';
      }
    } catch (error) {
      console.error("Erro ao consultar o Firebase:", error);
      return 'Erro ao buscar informações. Tente novamente mais tarde.';
    }
  };

  // Função para enviar uma mensagem
  const sendMessage = async (text: string) => {
    setMessages((prev) => [...prev, { user: 'user', text }]);
    
    // Simula uma consulta no Firebase com base no texto enviado
    const responseText = await fetchVehicleData(text);

    // Adiciona a resposta da IA
    setMessages((prev) => [...prev, { user: 'IA', text: responseText }]);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};
