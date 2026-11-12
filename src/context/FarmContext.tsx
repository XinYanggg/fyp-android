import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farm, Tree } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  selectedTree: Tree | null;
  isLoading: boolean;
  error: string | null;
  setSelectedFarm: (farm: Farm | null) => void;
  setSelectedTree: (tree: Tree | null) => void;
  refreshFarms: () => Promise<void>;
  addFarm: (name: string, location: string) => Promise<Farm>;
  addTree: (farmId: string, treeId: string, cultivar: string) => Promise<void>;
  addMember: (farmId: string, email: string) => Promise<void>;
  removeMember: (farmId: string, email: string) => Promise<void>;
  saveScan: (farmId: string, treeId: string, disease: string, confidence: number) => Promise<void>;
  detectDisease: (imageUri: string) => Promise<{ disease: string; confidence: number }>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const computeFarmStats = (farm: Farm): Farm => {
  const trees = farm.trees || [];
  const healthyCount = trees.filter((t) => t.currentDisease?.toLowerCase() === 'healthy').length;
  const healthPercentage = trees.length > 0 ? `${Math.round((healthyCount / trees.length) * 100)}%` : '100%';

  let latestTimestamp = 'N/A';
  for (const t of trees) {
    if (t.lastScan && t.lastScan !== 'N/A') {
      latestTimestamp = t.lastScan;
      break;
    }
  }

  return {
    ...farm,
    _id: farm._id.toString(),
    members: farm.members || [],
    trees,
    treeCount: trees.length,
    healthPercentage: farm.healthPercentage || healthPercentage,
    lastScan: farm.lastScan || latestTimestamp,
  };
};

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFarms = async () => {
    if (!token) {
      setFarms([]);
      setSelectedFarm(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const liveFarms = await api.getFarms();
      const enriched = (liveFarms || []).map(computeFarmStats);
      setFarms(enriched);

      // Retain selection if it still exists, otherwise select the first farm
      setSelectedFarm((prev) => {
        if (enriched.length === 0) return null;
        if (!prev) return enriched[0];
        return enriched.find((f) => f._id === prev._id) || enriched[0];
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load farms.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch farms whenever the signed-in user changes (and clear on logout)
  useEffect(() => {
    refreshFarms();
  }, [token, user?.email]);

  const addFarm = async (name: string, location: string): Promise<Farm> => {
    const created = computeFarmStats(await api.addFarm(name, location));
    setFarms((prev) => [created, ...prev]);
    setSelectedFarm(created);
    return created;
  };

  const addTree = async (farmId: string, treeId: string, cultivar: string): Promise<void> => {
    await api.addTree(farmId, treeId.toUpperCase().trim(), cultivar);
    await refreshFarms();
  };

  const applyMembers = (farmId: string, members: Farm['members']) => {
    setFarms((prev) => prev.map((f) => (f._id === farmId ? { ...f, members } : f)));
    setSelectedFarm((curr) => (curr && curr._id === farmId ? { ...curr, members } : curr));
  };

  const addMember = async (farmId: string, email: string): Promise<void> => {
    const res = await api.addMember(farmId, email.trim().toLowerCase());
    applyMembers(farmId, res.farm.members);
  };

  const removeMember = async (farmId: string, email: string): Promise<void> => {
    const res = await api.removeMember(farmId, email);
    applyMembers(farmId, res.farm.members);
  };

  const saveScan = async (farmId: string, treeId: string, disease: string, confidence: number) => {
    await api.saveScan(farmId, treeId, disease, confidence);
    await refreshFarms();
  };

  const detectDisease = async (imageUri: string): Promise<{ disease: string; confidence: number }> => {
    const data = await api.detectDisease(imageUri);
    if (!data?.prediction) {
      throw new Error('The AI service returned no prediction.');
    }
    // Format disease name: e.g. "algal_leaf_spot" -> "Algal Leaf Spot"
    const disease = data.prediction
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { disease, confidence: Math.round(data.confidence * 100) / 100 };
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarm,
        selectedTree,
        isLoading,
        error,
        setSelectedFarm,
        setSelectedTree,
        refreshFarms,
        addFarm,
        addTree,
        addMember,
        removeMember,
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
