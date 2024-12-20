import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const INITIAL_DATA = [
  { name: "Adair José Frasson Frassão", rg: "5.782.769-6", phone: "(45)99993-5301" },
  { name: "José Medeiros", rg: "8.308.237-2", phone: "(45)98829-9587" },
  { name: "Fernando José Divensi", rg: "6.980.812-3", phone: "(45)99832-5711" },
  { name: "Fábio Marcelo Monteiro Pires", rg: "9.383.111-0", phone: "(45)99959-5609" },
  { name: "Luiz Edgard Gauto", rg: "8.377.409-6", phone: "(45)99837-6265" },
  { name: "Janete Cristiane Munch", rg: "9.861.362-5", phone: "(45)99916-5472" },
  { name: "Valéria dos Anjos Macedo", rg: "10.130.556-2", phone: "(45)99847-3803" },
  { name: "André Felipe de Gois Santos", rg: "10.272.583-2", phone: "(45)99155-0244" },
  { name: "Luis Gustavo Guarnieri Sampaio", rg: "9.645.419-8", phone: "(45)99812-1719" },
  { name: "Cristiano Luiz Haczalla de Freitas", rg: "10.599.451-6", phone: "(45)99901-5938" },
  { name: "Douglas Antonio Garcia", rg: "6.690.717-1", phone: "(45)99900-2814" },
  { name: "Carlos Gilberto Zimmermann", rg: "6.596.793-6", phone: "(45)99938-6156" },
  { name: "Luan Siqueira", rg: "9.851.953-0", phone: "(45)99931-8791" },
  { name: "Cleverson João Tack", rg: "8.032.681-5", phone: "(45)99920-4328" },
  { name: "Sheila Regina Cornelius", rg: "9.012.547-8", phone: "(45)99823-1443" },
  { name: "Vivaldo Moreira dos Santos Junior", rg: "7.051.901-1", phone: "(45)99809-1881" },
  { name: "Cristian Heck", rg: "5.804.353-2", phone: "(45)98803-3792" },
  { name: "Alexandre Antonio de Sales", rg: "7.843.827-4", phone: "(45)99993-0295" },
  { name: "Alan Patrick Marujo", rg: "9.365.127-8", phone: "(45)99825-7533" },
  { name: "Willian José Bozz", rg: "8.169.814-7", phone: "(45)99831-1271" },
  { name: "Ivanir Mees", rg: "8.391.897-7", phone: "(45)99980-6628" },
  { name: "Laurindo Siqueira", rg: "8.668.085-8", phone: "(45)99830-5338" },
  { name: "Leonel Cesar Bertotti de Carvalho", rg: "9.754.959-1", phone: "(45)99918-4185" },
  { name: "Ademir Ditzmann", rg: "9.056.188-0", phone: "(45)99827-9837" },
  { name: "Maykon Camargo", rg: "8.172.201-3", phone: "(45)99990-1870" },
  { name: "Edson de Moraes", rg: "8.319.123-6", phone: "(45)99979-7194" },
  { name: "Diogo Bassani", rg: "6.849.580-6", phone: "(45)99956-3431" },
  { name: "Kléber Segato Pereira da Silva", rg: "8.459.732-5", phone: "(45)99121-1912" },
  { name: "Alex Sandro Rosso", rg: "8.380.975-2", phone: "(45)99107-1986" },
  { name: "Poliane Karin de Paula Rodrigues", rg: "8.855.588-0", phone: "(45)99814-1030" },
  { name: "Jean Michel Bernardon", rg: "9.906.068-9", phone: "(45)99948-2718" },
  { name: "Ricardo Bampi", rg: "9.747.917-8", phone: "(45)99107-1806" },
  { name: "Maurício Cleiton Roque", rg: "10.674.935-3", phone: "(45)99137-1963" },
  { name: "Patrick Pereira", rg: "9.585.760-4", phone: "(45)99854-8660" },
  { name: "Diego Araujo dos Santos", rg: "8.840.632-0", phone: "(45)99996-7257" },
  { name: "Rita Dusinski", rg: "9.419.361-3", phone: "(45)99928-2732" },
  { name: "Leandro Dametto", rg: "9.085.531-0", phone: "(45)99155-4752" },
  { name: "Vitor Augusto dos Santos Silva", rg: "9.840.003-6", phone: "(45)99958-7110" },
  { name: "Lucas Alexandre dos Reis Batista", rg: "8.315.817-4", phone: "(45)99954-0371" },
  { name: "Marcelo Alexandre Conrath", rg: "9.311.791-3", phone: "(45)99810-4835" },
  { name: "Anderson Felipe Parizotto dos Santos", rg: "9.942.333-1", phone: "(45)99136-0486" },
  { name: "Alexsander Capo Portilho", rg: "9.706.402-4", phone: "(46)93300-1105" },
  { name: "Gustavo Menezes de Almeida", rg: "9.975.270-0", phone: "(46)99914-3298" },
  { name: "Jéssica Calegari", rg: "10.832.780-4", phone: "(45)99851-1598" },
  { name: "Luiz Paulo Breda", rg: "10.088.970-6", phone: "(45)99924-1794" },
  { name: "Guilherme Marques Gonçalves", rg: "10.510.129-5", phone: "(45)99990-4217" },
  { name: "Cristian Filipin", rg: "8.875.398-4", phone: "(45)99840-1772" },
  { name: "Marisel Espínola Carvalho", rg: "10.781.827-8", phone: "(45)99967-7227" },
  { name: "Fernando Forgiarini", rg: "9.297.079-5", phone: "(45)99826-7691" },
  { name: "Gabriel Thoele", rg: "9.640.027-6", phone: "(45)99846-7181" },
  { name: "Carlos Henrique Tem Pass", rg: "10.071.498-1", phone: "(45)99805-3622" },
  { name: "Valdir José Meinerz", rg: "8.356.687-6", phone: "(45)99835-6510" },
  { name: "Jocimar Machado de Jesus", rg: "4.399.756-4", phone: "(45)99914-2823" },
  { name: "Bruno Vitorassi Suppi", rg: "9.719.479-3", phone: "(45)99988-3640" },
  { name: "Rodrigo Lima Ribeiro", rg: "9.366.083-8", phone: "(45)99847-4915" },
  { name: "Pedro Henrique Fagundes Marquardt", rg: "10.578.492-9", phone: "(45)98841-4636" },
  { name: "Henrique Diniz", rg: "9.436.632-1", phone: "(45)99960-8034" },
  { name: "Danielle Caroline de Almeida Cabanha", rg: "12.706.661-2", phone: "(45)99830-0826" },
  { name: "Marcos Donizetti Silveira", rg: "4.626.188-7", phone: "(45)99809-6054" },
  { name: "Viviane Giamarco Bueno", rg: "6.834.488-3", phone: "(45)99940-5733" },
  { name: "Valdemir Aguiar Ribas", rg: "8.892.171-2", phone: "(45)99911-0415" },
  { name: "Bruno Moura de Melo", rg: "9.158.065-9", phone: "(45)99912-9214" },
  { name: "Paulo Cesar Silva dos Santos", rg: "14.238.756-5", phone: "(45)98434-7444" },
  { name: "Daniel Lança Parra", rg: "16.241.189-6", phone: "(11)94878-5401" },
  { name: "Lucas Andrei Postai", rg: "12.761.215-3", phone: "(45)99986-3003" },
  { name: "Luiz Henrique da Silva Teleste", rg: "14.341.461-2", phone: "(45)99949-3769" },
  { name: "Jair Antônio Ferreira dos Santos", rg: "6.705.148-3", phone: "(45)99925-5970" },
  { name: "Jaqueline Valeria dos Santos", rg: "8.159.902-5", phone: "(45)99951-8403" },
  { name: "Rodrigo Foza", rg: "9.091.881-8", phone: "(45)99813-4668" },
  { name: "Jefferson Juliano dos Santos", rg: "8.915.843-5", phone: "(45)99925-4224" },
  { name: "Giovani Adamante Novelli", rg: "8.364.635-7", phone: "(45)99116-6188" },
  { name: "Jeferson Marcelo Rodrigues", rg: "9.845.102-1", phone: "(45)99848-3628" },
  { name: "Rafael Rambo Martins", rg: "9.369.815-0", phone: "(45)99906-9709" },
  { name: "Maira Fernanda de Oliveira dos Santos", rg: "9.813.897-8", phone: "(45)99910-7874" },
  { name: "Marcos Henrique Freire", rg: "10.360.762-0", phone: "(45)99810-0011" },
  { name: "Ana Carolina Moreira da Luz Weiss", rg: "10.746.652-5", phone: "(45)99917-7986" },
  { name: "Luiz Henrique de Souza Encina", rg: "9.835.693-2", phone: "(45)999554133" },
  { name: "Paulo Soares dos Santos", rg: "5.703.347-9", phone: "(45)99919-1511" },
  { name: "Simone Perego", rg: "6.172.970-4", phone: "(45)99911-9448" },
  { name: "Nei Antonio de Castro", rg: "6.373.359-8", phone: "(45)99918-0107" },
  { name: "José Gonçalves Netto", rg: "9.711.378-5", phone: "(45)99141-1696" },
  { name: "Franciela Aparecida Ostrovski", rg: "9.477.713-5", phone: "(45)99821-3165" },
  { name: "Marciel Francisco Novello", rg: "9.795.296-5", phone: "(45)99902-4208" },
  { name: "Anderson Felipe Canzi", rg: "8.695.871-6", phone: "(45)99119-1999" },
  { name: "Josadraque dos Santos", rg: "9.911.133-0", phone: "(45)99999-1179" }
];

export async function seedPersonnel() {
  try {
    const personnelRef = collection(db, 'personnel');
    const timestamp = new Date().toISOString();

    for (const person of INITIAL_DATA) {
      await addDoc(personnelRef, {
        ...person,
        rank: '',
        city: '',
        platoon: '',
        sector: '',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    console.log('Initial personnel data seeded successfully');
  } catch (error) {
    console.error('Error seeding personnel data:', error);
  }
}
