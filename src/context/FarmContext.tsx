import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farm, Tree } from '../types';
import { MOCK_FARMS } from '../data/mockData';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  selectedTree: Tree | null;
  isLoading: boolean;
  isLiveBackend: boolean;
  error: string | null;
  setSelectedFarm: (farm: Farm | null) => void;
  setSelectedTree: (tree: Tree | null) => void;
  refreshFarms: () => Promise<void>;
  addFarm: (name: string, location: string) => Promise<Farm>;
  addTree: (farmId: string, treeId: string, cultivar: string) => Promise<Tree>;
  saveScan: (farmId: string, treeId: string, disease: string, confidence: number, imageUrl?: string, notes?: string) => Promise<void>;
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
    _id: farm._id?.toString() || `farm-${Date.now()}`,
    treeCount: trees.length,
    healthPercentage: farm.healthPercentage || healthPercentage,
    lastScan: farm.lastScan || latestTimestamp,
  };
};

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();

  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(MOCK_FARMS[0] || null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFarms = async () => {
    if (!token) {
      // User is not logged in, keep mock data
      setFarms(MOCK_FARMS);
      if (!selectedFarm) setSelectedFarm(MOCK_FARMS[0]);
      setIsLiveBackend(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const liveFarms = await api.getFarms();
      const enriched = (liveFarms || []).map(computeFarmStats);
      setFarms(enriched);
      setIsLiveBackend(true);

      if (enriched.length > 0) {
        // Retain selection if exists, otherwise select first
        setSelectedFarm((prev) => {
          if (!prev) return enriched[0];
          const found = enriched.find((f) => f._id === prev._id);
          return found || enriched[0];
        });
      } else {
        setSelectedFarm(null);
      }
    } catch (err: any) {
      console.warn('Backend fetch failed, using mock data:', err.message);
      setError(err.message);
      setIsLiveBackend(false);
      // Fallback to mock data so UI remains interactive
      if (farms.length === 0) {
        setFarms(MOCK_FARMS);
        setSelectedFarm(MOCK_FARMS[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch farms when authentication state changes
  useEffect(() => {
    refreshFarms();
  }, [token, user?.email]);

  const addFarm = async (name: string, location: string): Promise<Farm> => {
    if (token && isLiveBackend) {
      try {
        const created = await api.addFarm(name, location);
        const enriched = computeFarmStats(created);
        setFarms((prev) => [enriched, ...prev]);
        setSelectedFarm(enriched);
        return enriched;
      } catch (err: any) {
        console.error('Failed to create farm on live backend:', err);
        throw err;
      }
    }

    // Local / Offline fallback
    const newFarm: Farm = {
      _id: `farm-${Date.now()}`,
      ownerEmail: user?.email || 'farmer@durian.health',
      name,
      location,
      treeCount: 0,
      lastScan: 'Just now',
      healthPercentage: '100%',
      members: [{ email: user?.email || 'farmer@durian.health', role: 'owner' }],
      trees: [],
    };
    setFarms((prev) => [newFarm, ...prev]);
    setSelectedFarm(newFarm);
    return newFarm;
  };

  const addTree = async (farmId: string, treeId: string, cultivar: string): Promise<Tree> => {
    const formattedTreeId = treeId.toUpperCase().trim();

    if (token && isLiveBackend) {
      try {
        await api.addTree(farmId, formattedTreeId, cultivar);
        await refreshFarms();
        const updatedFarm = farms.find((f) => f._id === farmId);
        const createdTree = updatedFarm?.trees?.find((t) => t.id === formattedTreeId);
        if (createdTree) return createdTree;
      } catch (err: any) {
        console.error('Failed to add tree on live backend:', err);
        throw err;
      }
    }

    // Local / Offline fallback
    const newTree: Tree = {
      id: formattedTreeId,
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
          return computeFarmStats({
            ...f,
            trees: updatedTrees,
          });
        }
        return f;
      })
    );

    setSelectedFarm((curr) => {
      if (!curr || curr._id !== farmId) return curr;
      return computeFarmStats({
        ...curr,
        trees: [newTree, ...curr.trees],
      });
    });

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
    if (token && isLiveBackend) {
      try {
        await api.saveScan(farmId, treeId, disease, confidence);
        await refreshFarms();
        return;
      } catch (err) {
        console.warn('Failed to save scan to live backend, applying locally:', err);
      }
    }

    // Local / Offline fallback
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newScan = {
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

        return computeFarmStats({
          ...farm,
          trees: updatedTrees,
        });
      })
    );

    setSelectedFarm((curr) => {
      if (!curr || curr._id !== farmId) return curr;
      const updatedTrees = curr.trees.map((t) =>
        t.id === treeId
          ? { ...t, currentDisease: disease, confidence, lastScan: now, scans: [newScan, ...t.scans] }
          : t
      );
      return computeFarmStats({ ...curr, trees: updatedTrees });
    });
  };

  const detectDisease = async (imageUri: string): Promise<{ disease: string; confidence: number }> => {
    // Attempt live AI inference via Next.js backend -> Python AI engine
    try {
      const data = await api.detectDisease(imageUri);
      if (data && data.prediction) {
        // Format disease name: e.g. "algal_leaf_spot" -> "Algal Leaf Spot"
        const formatted = data.prediction
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          disease: formatted,
          confidence: Math.round(data.confidence * 100) / 100,
        };
      }
    } catch (err: any) {
      console.warn('Live AI detection request failed, falling back to simulated inference:', err.message);
    }

    // Fallback simulation if backend or external AI service is temporarily unreachable
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const outcomes = [
      { disease: 'Algal Leaf Spot', confidence: 94.0 },
      { disease: 'Healthy', confidence: 98.5 },
      { disease: 'Leaf Spot', confidence: 88.0 },
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarm,
        selectedTree,
        isLoading,
        isLiveBackend,
        error,
        setSelectedFarm,
        setSelectedTree,
        refreshFarms,
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
