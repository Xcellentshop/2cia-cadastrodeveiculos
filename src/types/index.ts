// ... (keep existing type definitions)

interface TransferRecord {
  fromSector: Sector;
  toSector: Sector;
  date: string;
  reason?: string;
  userEmail?: string; // Add userEmail to track who made the transfer
}

export type Asset = {
  id?: string;
  sector: Sector;
  generalTag: string;
  localTag: string;
  description: string;
  assetClass: AssetClass;
  conservationState: ConservationState;
  acquisitionDate: string;
  incorporationType: IncorporationType;
  acquisitionValue: number;
  evaluationValue: number;
  netValue: number;
  createdAt: string;
  updatedAt: string;
  transferHistory?: TransferRecord[];
};