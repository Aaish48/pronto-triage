import { Patient, QueueStats } from '@/types/triage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, Clock, User, Heart, Activity,
  CheckCircle, ArrowUp, ArrowDown, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueDisplayProps {
  patients: Patient[];
  onPatientStatusChange: (patientId: string, status: Patient['status']) => void;
}

const priorityConfig = {
  critical: { 
    icon: AlertTriangle, 
    color: 'bg-critical text-critical-foreground', 
    bgColor: 'bg-critical/10 border-critical',
    order: 1
  },
  high: { 
    icon: ArrowUp, 
    color: 'bg-high text-high-foreground', 
    bgColor: 'bg-high/10 border-high',
    order: 2
  },
  medium: { 
    icon: Clock, 
    color: 'bg-medium text-medium-foreground', 
    bgColor: 'bg-medium/10 border-medium',
    order: 3
  },
  low: { 
    icon: ArrowDown, 
    color: 'bg-low text-low-foreground', 
    bgColor: 'bg-low/10 border-low',
    order: 4
  },
  stable: { 
    icon: CheckCircle, 
    color: 'bg-stable text-stable-foreground', 
    bgColor: 'bg-stable/10 border-stable',
    order: 5
  }
};

export default function QueueDisplay({ patients, onPatientStatusChange }: QueueDisplayProps) {
  // Sort patients by priority and timestamp
  const sortedPatients = [...patients].sort((a, b) => {
    const priorityDiff = priorityConfig[a.priorityLevel].order - priorityConfig[b.priorityLevel].order;
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const waitingPatients = sortedPatients.filter(p => p.status === 'waiting');
  const inProgressPatients = sortedPatients.filter(p => p.status === 'in-progress');
  const completedPatients = sortedPatients.filter(p => p.status === 'completed');

  // Calculate queue statistics
  const stats: QueueStats = {
    totalPatients: patients.length,
    averageWaitTime: patients.reduce((sum, p) => sum + p.estimatedWaitTime, 0) / (patients.length || 1),
    criticalCount: patients.filter(p => p.priorityLevel === 'critical').length,
    highCount: patients.filter(p => p.priorityLevel === 'high').length,
    mediumCount: patients.filter(p => p.priorityLevel === 'medium').length,
    lowCount: patients.filter(p => p.priorityLevel === 'low').length,
    stableCount: patients.filter(p => p.priorityLevel === 'stable').length
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'IMMEDIATE';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.round(minutes / 60)} hr`;
  };

  const PatientCard = ({ patient }: { patient: Patient }) => {
    const config = priorityConfig[patient.priorityLevel];
    const Icon = config.icon;

    return (
      <Card className={cn("transition-all duration-200", config.bgColor)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={config.color}>
                {patient.priorityLevel.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Score: {patient.priorityScore}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Wait: {formatTime(patient.estimatedWaitTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              <span>Arrived: {new Date(patient.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Symptoms:</p>
            <div className="flex flex-wrap gap-1">
              {patient.symptoms.map(symptom => (
                <Badge key={symptom} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {patient.description && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm text-muted-foreground">{patient.description}</p>
            </div>
          )}

          {patient.vitalSigns && (
            <div className="mb-4 p-2 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Vitals:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {patient.vitalSigns.temperature && (
                  <span>Temp: {patient.vitalSigns.temperature}°F</span>
                )}
                {patient.vitalSigns.heartRate && (
                  <span>HR: {patient.vitalSigns.heartRate}</span>
                )}
                {patient.vitalSigns.bloodPressure && (
                  <span>BP: {patient.vitalSigns.bloodPressure}</span>
                )}
                {patient.vitalSigns.oxygenSaturation && (
                  <span>O2: {patient.vitalSigns.oxygenSaturation}%</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {patient.status === 'waiting' && (
              <Button 
                onClick={() => onPatientStatusChange(patient.id, 'in-progress')}
                size="sm" 
                className="flex-1"
              >
                Start Treatment
              </Button>
            )}
            {patient.status === 'in-progress' && (
              <Button 
                onClick={() => onPatientStatusChange(patient.id, 'completed')}
                size="sm" 
                variant="outline"
                className="flex-1"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Queue Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-critical">{stats.criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-high">{stats.highCount}</div>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-medium">{stats.mediumCount}</div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-low">{stats.lowCount}</div>
              <div className="text-sm text-muted-foreground">Low</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-stable">{stats.stableCount}</div>
              <div className="text-sm text-muted-foreground">Stable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(stats.averageWaitTime)}</div>
              <div className="text-sm text-muted-foreground">Avg Wait (min)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Waiting ({waitingPatients.length})</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {waitingPatients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No patients waiting</p>
                ) : (
                  waitingPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>In Treatment ({inProgressPatients.length})</span>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {inProgressPatients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active treatments</p>
                ) : (
                  inProgressPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Completed ({completedPatients.length})</span>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {completedPatients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed patients</p>
                ) : (
                  completedPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}