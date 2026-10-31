export interface Member {
  email: string;
  role: 'owner' | 'member';
}

export interface ScanEntry {
  id?: string;
  disease: string;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
  notes?: string;
}

export interface Tree {
  id: string;
  cultivar: string;
  currentDisease: string;
  confidence: number;
  lastScan: string;
  scans: ScanEntry[];
}

export interface Farm {
  _id: string;
  ownerEmail: string;
  name: string;
  location: string;
  treeCount: number;
  members: Member[];
  trees: Tree[];
  lastScan: string;
  healthPercentage: string;
}

export interface DiseaseInfo {
  name: string;
  severity: 'healthy' | 'moderate' | 'high' | 'critical';
  description: string;
  symptoms: string[];
  treatment: string[];
}

