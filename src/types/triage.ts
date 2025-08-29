export interface Patient {
  id: string;
  name: string;
  age: number;
  symptoms: string[];
  description: string;
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
  };
  timestamp: Date;
  priorityScore: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low' | 'stable';
  estimatedWaitTime: number;
  status: 'waiting' | 'in-progress' | 'completed';
}

export interface TriageResult {
  priorityScore: number;
  priorityLevel: Patient['priorityLevel'];
  estimatedWaitTime: number;
  reasoning: string[];
}

export interface QueueStats {
  totalPatients: number;
  averageWaitTime: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  stableCount: number;
}