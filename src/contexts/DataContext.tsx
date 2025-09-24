import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../utils/storage';

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

const FINANCIAL_DATA_KEY = 'pegase_financial_data';
const QOE_ADJUSTMENTS_KEY = 'pegase_qoe_adjustments';
const IMPORTED_FILES_KEY = 'pegase_imported_files';
const LAST_SAVE_KEY = 'pegase_last_save';

const DEFAULT_FINANCIAL_DATA: FinancialData = {
  revenue: { current: 12500000, previous: 10850000 },
  ebitda: { current: 2100000, previous: 1850000 },
  ebitdaNormalized: 1935000,
  netDebt: { current: 950000, previous: 1080000 },
  workingCapital: { current: 1800000, previous: 1950000 }
};

const DEFAULT_QOE_ADJUSTMENTS: QoEAdjustment[] = [
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
];

const DEFAULT_IMPORTED_FILES: ImportedFile[] = [
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
];

const QOE_TYPES: QoEAdjustment['type'][] = ['add', 'remove'];
const QOE_CATEGORIES: QoEAdjustment['category'][] = ['Non-récurrent', 'Owner benefit', 'Normalisation'];
const QOE_STATUSES: QoEAdjustment['status'][] = ['pending', 'accepted', 'rejected'];
const IMPORT_TYPES: ImportedFile['type'][] = ['FEC', 'Balance', 'GL', 'Auxiliaire'];
const IMPORT_STATUSES: ImportedFile['status'][] = ['uploading', 'processing', 'completed', 'error'];

type FinancialMetric = FinancialData['revenue'];
type FinancialDataShape = Partial<{
  revenue: Partial<FinancialMetric>;
  ebitda: Partial<FinancialMetric>;
  ebitdaNormalized: unknown;
  netDebt: Partial<FinancialMetric>;
  workingCapital: Partial<FinancialMetric>;
}>;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function createDefaultFinancialData(): FinancialData {
  return {
    revenue: { ...DEFAULT_FINANCIAL_DATA.revenue },
    ebitda: { ...DEFAULT_FINANCIAL_DATA.ebitda },
    ebitdaNormalized: DEFAULT_FINANCIAL_DATA.ebitdaNormalized,
    netDebt: { ...DEFAULT_FINANCIAL_DATA.netDebt },
    workingCapital: { ...DEFAULT_FINANCIAL_DATA.workingCapital }
  };
}

function createDefaultQoeAdjustments(): QoEAdjustment[] {
  return DEFAULT_QOE_ADJUSTMENTS.map(adjustment => ({ ...adjustment }));
}

function createDefaultImportedFiles(): ImportedFile[] {
  return DEFAULT_IMPORTED_FILES.map(file => ({
    ...file,
    controls: file.controls ? { ...file.controls } : undefined
  }));
}

function parseJSON<T>(value: string | null, key: string): T | undefined {
  if (value === null) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Stored data for ${key} could not be parsed`, error);
    return undefined;
  }
}

function sanitizeMetric(metric: Partial<FinancialMetric> | undefined, fallback: FinancialMetric): FinancialMetric {
  const current = toFiniteNumber(metric?.current);
  const previous = toFiniteNumber(metric?.previous);

  return {
    current: current ?? fallback.current,
    previous: previous ?? fallback.previous
  };
}

function sanitizeFinancialData(raw: unknown): FinancialData {
  if (!raw || typeof raw !== 'object') {
    return createDefaultFinancialData();
  }

  const data = raw as FinancialDataShape;

  return {
    revenue: sanitizeMetric(data.revenue, DEFAULT_FINANCIAL_DATA.revenue),
    ebitda: sanitizeMetric(data.ebitda, DEFAULT_FINANCIAL_DATA.ebitda),
    ebitdaNormalized:
      toFiniteNumber(data.ebitdaNormalized) ?? DEFAULT_FINANCIAL_DATA.ebitdaNormalized,
    netDebt: sanitizeMetric(data.netDebt, DEFAULT_FINANCIAL_DATA.netDebt),
    workingCapital: sanitizeMetric(data.workingCapital, DEFAULT_FINANCIAL_DATA.workingCapital)
  };
}

function sanitizeQoeAdjustments(raw: unknown): QoEAdjustment[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const sanitized: QoEAdjustment[] = [];

  raw.forEach(entry => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const candidate = entry as Partial<QoEAdjustment>;
    const amount = toFiniteNumber(candidate.amount);
    const confidence = toFiniteNumber(candidate.confidence);

    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.item !== 'string' ||
      amount === null ||
      !QOE_TYPES.includes(candidate.type as QoEAdjustment['type']) ||
      !QOE_CATEGORIES.includes(candidate.category as QoEAdjustment['category']) ||
      confidence === null ||
      typeof candidate.description !== 'string' ||
      typeof candidate.dateAdded !== 'string' ||
      !QOE_STATUSES.includes(candidate.status as QoEAdjustment['status'])
    ) {
      return;
    }

    sanitized.push({
      id: candidate.id,
      item: candidate.item,
      amount,
      type: candidate.type as QoEAdjustment['type'],
      category: candidate.category as QoEAdjustment['category'],
      confidence: Math.max(0, Math.min(100, confidence)),
      status: candidate.status as QoEAdjustment['status'],
      description: candidate.description,
      dateAdded: candidate.dateAdded
    });
  });

  return sanitized;
}

function sanitizeImportedFiles(raw: unknown): ImportedFile[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const sanitized: ImportedFile[] = [];

  raw.forEach(entry => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const candidate = entry as Partial<ImportedFile>;
    const progress = toFiniteNumber(candidate.progress);

    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.name !== 'string' ||
      typeof candidate.size !== 'string' ||
      !IMPORT_TYPES.includes(candidate.type as ImportedFile['type']) ||
      !IMPORT_STATUSES.includes(candidate.status as ImportedFile['status']) ||
      progress === null ||
      typeof candidate.dateImported !== 'string' ||
      Number.isNaN(new Date(candidate.dateImported).getTime())
    ) {
      return;
    }

    let controls: ImportedFile['controls'] | undefined;
    if (candidate.controls && typeof candidate.controls === 'object') {
      const controlsCandidate = candidate.controls as Partial<ImportedFile['controls']>;
      const totalLines = toFiniteNumber(controlsCandidate.totalLines);
      const validLines = toFiniteNumber(controlsCandidate.validLines);
      const warnings = toFiniteNumber(controlsCandidate.warnings);
      const errors = toFiniteNumber(controlsCandidate.errors);

      if (
        totalLines !== null &&
        validLines !== null &&
        warnings !== null &&
        errors !== null
      ) {
        controls = {
          totalLines,
          validLines,
          warnings,
          errors
        };
      }
    }

    sanitized.push({
      id: candidate.id,
      name: candidate.name,
      size: candidate.size,
      type: candidate.type as ImportedFile['type'],
      status: candidate.status as ImportedFile['status'],
      progress: Math.max(0, Math.min(100, progress)),
      dateImported: candidate.dateImported,
      controls
    });
  });

  return sanitized;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [financialData, setFinancialData] = useState<FinancialData>(() => createDefaultFinancialData());
  const [qoeAdjustments, setQoeAdjustments] = useState<QoEAdjustment[]>(() => createDefaultQoeAdjustments());
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>(() => createDefaultImportedFiles());

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

  const saveData = useCallback(() => {
    try {
      safeSetItem(FINANCIAL_DATA_KEY, JSON.stringify(financialData));
      safeSetItem(QOE_ADJUSTMENTS_KEY, JSON.stringify(qoeAdjustments));
      safeSetItem(IMPORTED_FILES_KEY, JSON.stringify(importedFiles));
      safeSetItem(LAST_SAVE_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [financialData, qoeAdjustments, importedFiles]);

  const loadData = useCallback(() => {
    try {
      const savedFinancialData = parseJSON<unknown>(safeGetItem(FINANCIAL_DATA_KEY), FINANCIAL_DATA_KEY);
      if (savedFinancialData !== undefined) {
        setFinancialData(sanitizeFinancialData(savedFinancialData));
      }

      const savedQoeAdjustments = parseJSON<unknown>(safeGetItem(QOE_ADJUSTMENTS_KEY), QOE_ADJUSTMENTS_KEY);
      if (savedQoeAdjustments !== undefined) {
        const sanitizedAdjustments = sanitizeQoeAdjustments(savedQoeAdjustments);
        if (sanitizedAdjustments !== undefined) {
          setQoeAdjustments(sanitizedAdjustments);
        }
      }

      const savedImportedFiles = parseJSON<unknown>(safeGetItem(IMPORTED_FILES_KEY), IMPORTED_FILES_KEY);
      if (savedImportedFiles !== undefined) {
        const sanitizedFiles = sanitizeImportedFiles(savedImportedFiles);
        if (sanitizedFiles !== undefined) {
          setImportedFiles(sanitizedFiles);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setFinancialData(createDefaultFinancialData());
      setQoeAdjustments(createDefaultQoeAdjustments());
      setImportedFiles(createDefaultImportedFiles());
    }
  }, []);

  const clearData = useCallback(() => {
    safeRemoveItem(FINANCIAL_DATA_KEY);
    safeRemoveItem(QOE_ADJUSTMENTS_KEY);
    safeRemoveItem(IMPORTED_FILES_KEY);
    safeRemoveItem(LAST_SAVE_KEY);

    setFinancialData(createDefaultFinancialData());
    setQoeAdjustments(createDefaultQoeAdjustments());
    setImportedFiles(createDefaultImportedFiles());
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveData();
    }, 30000);

    return () => clearInterval(interval);
  }, [saveData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

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