import React, { createContext, useContext, useState, useEffect } from 'react';

interface FinancialData {
  revenue: { current: number; previous: number };
  ebitda: { current: number; previous: number };
  ebitdaNormalized: number;
  netDebt: { current: number; previous: number };
  workingCapital: { current: number; previous: number };
}

interface QoEAdjustment {
  id: string;
  item: string;
  amount: number;
  type: 'add' | 'remove';
  category: 'Non-récurrent' | 'Owner benefit' | 'Normalisation';
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
  description: string;
  dateAdded: string;
}

interface ImportedFile {
  id: string;
  name: string;
  size: string;
  type: 'FEC' | 'Balance' | 'GL' | 'Auxiliaire';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  dateImported: string;
  controls?: {
    totalLines: number;
    validLines: number;
    warnings: number;
    errors: number;
  };
}

interface DataContextType {
  financialData: FinancialData;
  qoeAdjustments: QoEAdjustment[];
  importedFiles: ImportedFile[];
  setFinancialData: (data: FinancialData) => void;
  setQoeAdjustments: (adjustments: QoEAdjustment[]) => void;
  addQoeAdjustment: (adjustment: Omit<QoEAdjustment, 'id' | 'dateAdded'>) => void;
  updateQoeAdjustment: (id: string, updates: Partial<QoEAdjustment>) => void;
  removeQoeAdjustment: (id: string) => void;
  setImportedFiles: (files: ImportedFile[]) => void;
  addImportedFile: (file: Omit<ImportedFile, 'id' | 'dateImported'>) => void;
  saveData: () => void;
  loadData: () => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: { current: 12500000, previous: 10850000 },
    ebitda: { current: 2100000, previous: 1850000 },
    ebitdaNormalized: 1935000,
    netDebt: { current: 950000, previous: 1080000 },
    workingCapital: { current: 1800000, previous: 1950000 }
  });

  const [qoeAdjustments, setQoeAdjustments] = useState<QoEAdjustment[]>([
    {
      id: '1',
      item: 'Prime dirigeant exceptionnelle',
      amount: -85000,
      type: 'remove',
      category: 'Owner benefit',
      confidence: 95,
      status: 'pending',
      description: 'Prime versée au dirigeant non récurrente',
      dateAdded: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      item: 'Gain cession immobilier',
      amount: -120000,
      type: 'remove',
      category: 'Non-récurrent',
      confidence: 98,
      status: 'accepted',
      description: 'Plus-value exceptionnelle sur cession terrain',
      dateAdded: '2025-01-15T09:15:00Z'
    },
    {
      id: '3',
      item: 'Provision restructuration',
      amount: 45000,
      type: 'add',
      category: 'Normalisation',
      confidence: 87,
      status: 'pending',
      description: 'Coûts de restructuration non récurrents',
      dateAdded: '2025-01-15T08:45:00Z'
    }
  ]);

  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([
    {
      id: '1',
      name: 'FEC_2024_SOCIETE_ABC.txt',
      size: '2.5MB',
      type: 'FEC',
      status: 'completed',
      progress: 100,
      dateImported: '2025-01-15T14:30:00Z',
      controls: {
        totalLines: 8547,
        validLines: 8523,
        warnings: 15,
        errors: 2
      }
    },
    {
      id: '2',
      name: 'Balance_Dec2024.xlsx',
      size: '450KB',
      type: 'Balance',
      status: 'completed',
      progress: 100,
      dateImported: '2025-01-14T16:20:00Z',
      controls: {
        totalLines: 342,
        validLines: 342,
        warnings: 0,
        errors: 0
      }
    }
  ]);

  const addQoeAdjustment = (adjustment: Omit<QoEAdjustment, 'id' | 'dateAdded'>) => {
    const newAdjustment: QoEAdjustment = {
      ...adjustment,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString()
    };
    setQoeAdjustments(prev => [...prev, newAdjustment]);
  };

  const updateQoeAdjustment = (id: string, updates: Partial<QoEAdjustment>) => {
    setQoeAdjustments(prev => prev.map(adj => 
      adj.id === id ? { ...adj, ...updates } : adj
    ));
  };

  const removeQoeAdjustment = (id: string) => {
    setQoeAdjustments(prev => prev.filter(adj => adj.id !== id));
  };

  const addImportedFile = (file: Omit<ImportedFile, 'id' | 'dateImported'>) => {
    const newFile: ImportedFile = {
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      dateImported: new Date().toISOString()
    };
    setImportedFiles(prev => [...prev, newFile]);
  };

  const saveData = () => {
    try {
      localStorage.setItem('pegase_financial_data', JSON.stringify(financialData));
      localStorage.setItem('pegase_qoe_adjustments', JSON.stringify(qoeAdjustments));
      localStorage.setItem('pegase_imported_files', JSON.stringify(importedFiles));
      localStorage.setItem('pegase_last_save', new Date().toISOString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = () => {
    try {
      const savedFinancialData = localStorage.getItem('pegase_financial_data');
      const savedQoeAdjustments = localStorage.getItem('pegase_qoe_adjustments');
      const savedImportedFiles = localStorage.getItem('pegase_imported_files');

      if (savedFinancialData) {
        setFinancialData(JSON.parse(savedFinancialData));
      }
      if (savedQoeAdjustments) {
        setQoeAdjustments(JSON.parse(savedQoeAdjustments));
      }
      if (savedImportedFiles) {
        setImportedFiles(JSON.parse(savedImportedFiles));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const clearData = () => {
    localStorage.removeItem('pegase_financial_data');
    localStorage.removeItem('pegase_qoe_adjustments');
    localStorage.removeItem('pegase_imported_files');
    localStorage.removeItem('pegase_last_save');
    
    // Reset to default values
    setFinancialData({
      revenue: { current: 12500000, previous: 10850000 },
      ebitda: { current: 2100000, previous: 1850000 },
      ebitdaNormalized: 1935000,
      netDebt: { current: 950000, previous: 1080000 },
      workingCapital: { current: 1800000, previous: 1950000 }
    });
    setQoeAdjustments([]);
    setImportedFiles([]);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveData();
    }, 30000);

    return () => clearInterval(interval);
  }, [financialData, qoeAdjustments, importedFiles]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{
      financialData,
      qoeAdjustments,
      importedFiles,
      setFinancialData,
      setQoeAdjustments,
      addQoeAdjustment,
      updateQoeAdjustment,
      removeQoeAdjustment,
      setImportedFiles,
      addImportedFile,
      saveData,
      loadData,
      clearData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}