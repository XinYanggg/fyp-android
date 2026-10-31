import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Farm, Tree, ScanEntry } from '../types';
import { MOCK_FARMS } from '../data/mockData';

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  selectedTree: Tree | null;
  setSelectedFarm: (farm: Farm | null) => void;
  setSelectedTree: (tree: Tree | null) => void;
  addFarm: (name: string, location: string) => Promise<Farm>;
  addTree: (farmId: string, treeId: string, cultivar: string) => Promise<Tree>;
  saveScan: (farmId: string, treeId: string, disease: string, confidence: number, imageUrl?: string, notes?: string) => Promise<void>;
  detectDisease: (imageUri: string) => Promise<{ disease: string; confidence: number }>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(MOCK_FARMS[0] || null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  const addFarm = async (name: string, location: string): Promise<Farm> => {
    const newFarm: Farm = {
      _id: `farm-${Date.now()}`,
      ownerEmail: 'farmer@durian.health',
      name,
      location,
      treeCount: 0,
      lastScan: 'Just now',
      healthPercentage: '100%',
      members: [{ email: 'farmer@durian.health', role: 'owner' }],
      trees: [],
    };
    setFarms((prev) => [newFarm, ...prev]);
    setSelectedFarm(newFarm);
    return newFarm;
  };

  const addTree = async (farmId: string, treeId: string, cultivar: string): Promise<Tree> => {
    const newTree: Tree = {
      id: treeId.toUpperCase(),
      cultivar,
      currentDisease: 'Healthy',
      confidence: 1.0,
      lastScan: 'Just now',
      scans: [
        {
          id: `scan-${Date.now()}`,
          disease: 'Healthy',
          confidence: 1.0,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
      ],
    };

    setFarms((prev) =>
      prev.map((f) => {
        if (f._id === farmId) {
          const updatedTrees = [newTree, ...f.trees];
          return {
            ...f,
            treeCount: updatedTrees.length,
            trees: updatedTrees,
          };
        }
        return f;
      })
    );

    if (selectedFarm?._id === farmId) {
      setSelectedFarm((prev) => (prev ? { ...prev, trees: [newTree, ...prev.trees], treeCount: prev.trees.length + 1 } : null));
    }

    return newTree;
  };

  const saveScan = async (
    farmId: string,
    treeId: string,
    disease: string,
    confidence: number,
    imageUrl?: string,
    notes?: string
  ) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newScan: ScanEntry = {
      id: `scan-${Date.now()}`,
      disease,
      confidence,
      timestamp: now,
      imageUrl,
      notes,
    };

    setFarms((prev) =>
      prev.map((farm) => {
        if (farm._id !== farmId) return farm;

        const updatedTrees = farm.trees.map((tree) => {
          if (tree.id !== treeId) return tree;

          return {
            ...tree,
            currentDisease: disease,
            confidence,
            lastScan: now,
            scans: [newScan, ...tree.scans],
          };
        });

        // Recalculate health %
        const healthyCount = updatedTrees.filter((t) => t.currentDisease === 'Healthy').length;
        const healthPct = updatedTrees.length > 0 ? `${Math.round((healthyCount / updatedTrees.length) * 100)}%` : '100%';

        return {
          ...farm,
          lastScan: now,
          healthPercentage: healthPct,
          trees: updatedTrees,
        };
      })
    );

    // Also update selectedFarm if active
    setSelectedFarm((curr) => {
      if (!curr || curr._id !== farmId) return curr;
      const updatedTrees = curr.trees.map((t) => (t.id === treeId ? { ...t, currentDisease: disease, confidence, lastScan: now, scans: [newScan, ...t.scans] } : t));
      return { ...curr, trees: updatedTrees, lastScan: now };
    });
  };

  // Phase 1 Mock detection: simulates 1.2s AI inference and returns leaf diagnosis
  const detectDisease = async (_imageUri: string): Promise<{ disease: string; confidence: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const outcomes = [
      { disease: 'Algal Leaf Spot', confidence: 0.94 },
      { disease: 'Healthy', confidence: 0.98 },
      { disease: 'Leaf Spot', confidence: 0.88 },
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarm,
        selectedTree,
        setSelectedFarm,
        setSelectedTree,
        addFarm,
        addTree,
        saveScan,
        detectDisease,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarms = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarms must be used within a FarmProvider');
  }
  return context;
};

