export type Rank = 
  | 'Soldado 2ª Classe'
  | 'Soldado 1ª Classe'
  | 'Cabo'
  | '1º Sargento'
  | '2º Sargento'
  | '3º Sargento'
  | '4º Sargento'
  | '1º Tenente'
  | '2º Tenente'
  | 'Capitão'
  | 'Major'
  | 'Tenente-Coronel'
  | 'Coronel';

export type City = 'Medianeira' | 'Missal' | 'SMI' | 'Itaipulândia' | 'Serranópolis';

export type Sector = 
  | 'COMANDO'
  | 'SUBCOMANDO'
  | 'ADM'
  | 'ROTAM'
  | 'RPA'
  | 'COPOM'
  | 'P2'
  | 'RURAL'
  | 'Licença Médica'
  | 'Licença Especial'
  | 'Licença Capacitação'
  | 'Adido'
  | 'Afastado Judicialmente'
  | 'Férias'
  | 'Em Curso'
  | 'ADC';

export type Platoon = '1º Pelotão' | '2º Pelotão' | 'Não Pertence';

export interface Personnel {
  id?: string;
  rank: Rank;
  name: string;
  rg: string;
  phone: string;
  city: City;
  platoon: Platoon;
  sector: Sector;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPersonnel {
  name: string;
  rg: string;
  phone: string;
}

// Constants
export const RANKS: Rank[] = [
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

export const CITIES: City[] = [
  'Medianeira',
  'Missal',
  'SMI',
  'Itaipulândia',
  'Serranópolis'
];

export const SECTORS: Sector[] = [
  'COMANDO',
  'SUBCOMANDO',
  'ADM',
  'ROTAM',
  'RPA',
  'COPOM',
  'P2',
  'RURAL',
  'Licença Médica',
  'Licença Especial',
  'Licença Capacitação',
  'Adido',
  'Afastado Judicialmente',
  'Férias',
  'Em Curso',
  'ADC'
];

export const PLATOONS: Platoon[] = [
  '1º Pelotão',
  '2º Pelotão',
  'Não Pertence'
];