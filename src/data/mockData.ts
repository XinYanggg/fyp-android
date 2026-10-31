import { Farm, DiseaseInfo } from '../types';

export const MOCK_FARMS: Farm[] = [
  {
    _id: 'farm-1',
    ownerEmail: 'farmer@durian.health',
    name: 'Raub Musang King Estate',
    location: 'Raub, Pahang',
    treeCount: 36,
    lastScan: '2026-10-22',
    healthPercentage: '92%',
    members: [
      { email: 'farmer@durian.health', role: 'owner' },
      { email: 'worker1@durian.health', role: 'member' },
    ],
    trees: [
      {
        id: 'MK-01',
        cultivar: 'Musang King (D197)',
        currentDisease: 'Healthy',
        confidence: 0.98,
        lastScan: '2026-10-22',
        scans: [
          {
            id: 'scan-1',
            disease: 'Healthy',
            confidence: 0.98,
            timestamp: '2026-10-22 09:30',
          },
          {
            id: 'scan-2',
            disease: 'Healthy',
            confidence: 0.96,
            timestamp: '2026-10-15 14:10',
          },
        ],
      },
      {
        id: 'MK-02',
        cultivar: 'Musang King (D197)',
        currentDisease: 'Algal Leaf Spot',
        confidence: 0.89,
        lastScan: '2026-10-21',
        scans: [
          {
            id: 'scan-3',
            disease: 'Algal Leaf Spot',
            confidence: 0.89,
            timestamp: '2026-10-21 11:15',
            notes: 'Rust-colored spots observed on lower foliage.',
          },
        ],
      },
      {
        id: 'BT-01',
        cultivar: 'Black Thorn (D200)',
        currentDisease: 'Leaf Spot',
        confidence: 0.84,
        lastScan: '2026-10-20',
        scans: [
          {
            id: 'scan-4',
            disease: 'Leaf Spot',
            confidence: 0.84,
            timestamp: '2026-10-20 16:45',
          },
        ],
      },
      {
        id: 'D24-01',
        cultivar: 'D24 (Sultan)',
        currentDisease: 'Healthy',
        confidence: 0.99,
        lastScan: '2026-10-22',
        scans: [
          {
            id: 'scan-5',
            disease: 'Healthy',
            confidence: 0.99,
            timestamp: '2026-10-22 08:00',
          },
        ],
      },
      {
        id: 'IOI-01',
        cultivar: 'IOI / Hasmuk (D168)',
        currentDisease: 'Healthy',
        confidence: 0.95,
        lastScan: '2026-10-18',
        scans: [
          {
            id: 'scan-6',
            disease: 'Healthy',
            confidence: 0.95,
            timestamp: '2026-10-18 10:20',
          },
        ],
      },
    ],
  },
  {
    _id: 'farm-2',
    ownerEmail: 'farmer@durian.health',
    name: 'Bentong Golden Hills',
    location: 'Bentong, Pahang',
    treeCount: 24,
    lastScan: '2026-10-19',
    healthPercentage: '88%',
    members: [{ email: 'farmer@durian.health', role: 'owner' }],
    trees: [
      {
        id: 'MK-10',
        cultivar: 'Musang King (D197)',
        currentDisease: 'Healthy',
        confidence: 0.97,
        lastScan: '2026-10-19',
        scans: [
          {
            id: 'scan-7',
            disease: 'Healthy',
            confidence: 0.97,
            timestamp: '2026-10-19 13:00',
          },
        ],
      },
      {
        id: 'BT-05',
        cultivar: 'Black Thorn (D200)',
        currentDisease: 'Healthy',
        confidence: 0.94,
        lastScan: '2026-10-18',
        scans: [
          {
            id: 'scan-8',
            disease: 'Healthy',
            confidence: 0.94,
            timestamp: '2026-10-18 15:30',
          },
        ],
      },
    ],
  },
];

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  Healthy: {
    name: 'Healthy Foliage',
    severity: 'healthy',
    description: 'The leaf appears vibrant and free of active pathogenic lesions or nutrient deficiencies.',
    symptoms: ['Consistent green pigmentation', 'Smooth leaf surface', 'Intact margins'],
    treatment: ['Maintain scheduled organic fertilization', 'Standard preventive neem oil spraying'],
  },
  'Algal Leaf Spot': {
    name: 'Algal Leaf Spot (Cephaleuros virescens)',
    severity: 'moderate',
    description: 'A parasitic green alga causing circular, velvety, rust-orange to grey-green spots on mature leaves.',
    symptoms: ['Raised orange-brown cushiony spots', 'Yellowing chlorotic halos', 'Early leaf senescence'],
    treatment: [
      'Prune dense canopy branches to improve air circulation and sunlight penetration',
      'Apply copper hydroxide or copper oxychloride fungicide spray at 14-day intervals',
      'Remove and safely dispose of heavily infected fallen leaves',
    ],
  },
  'Leaf Spot': {
    name: 'Cercospora / Colletotrichum Leaf Spot',
    severity: 'high',
    description: 'Fungal infection forming necrotic brown lesions with yellow concentric borders, common in humid seasons.',
    symptoms: ['Small circular dark spots expanding outwards', 'Necrotic dry centers that may drop out', 'Defoliation of upper canopy'],
    treatment: [
      'Apply systemic fungicide (e.g. Difenoconazole or Azoxystrobin)',
      'Avoid overhead watering during morning hours',
      'Supplement tree nutrition with potassium and phosphite booster',
    ],
  },
};

