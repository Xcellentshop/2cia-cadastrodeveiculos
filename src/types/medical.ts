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

export type LeaveType = 
  | 'medical'
  | 'special'
  | 'training'
  | 'attached'
  | 'judicial'
  | 'vacation'
  | 'course';

export interface MedicalLeave {
  id?: string;
  rank: Rank;
  warName: string;
  leaveType: LeaveType;
  cid?: string;
  observation?: string;
  startDate: string;
  endDate?: string;
  isIndeterminate: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'returned';
}