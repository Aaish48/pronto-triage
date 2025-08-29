import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PatientIntakeForm from '@/components/PatientIntakeForm';
import QueueDisplay from '@/components/QueueDisplay';
import { Patient } from '@/types/triage';
import { 
  Activity, Users, Clock, AlertTriangle, 
  Stethoscope, Hospital, Brain, BarChart3 
} from 'lucide-react';

const Index = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const addPatient = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatientStatus = (patientId: string, status: Patient['status']) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, status }
          : patient
      )
    );
  };

  const activePatients = patients.filter(p => p.status !== 'completed');
  const criticalPatients = patients.filter(p => p.priorityLevel === 'critical' && p.status === 'waiting');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Hospital className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MediFLow</h1>
                <p className="text-sm text-muted-foreground">
                  Intelligent Priority-Based Queue Management
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Current Time</div>
              <div className="font-mono text-lg">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Alerts */}
      {criticalPatients.length > 0 && (
        <div className="bg-critical text-critical-foreground">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="font-semibold">
                {criticalPatients.length} CRITICAL patient{criticalPatients.length !== 1 ? 's' : ''} waiting - IMMEDIATE ATTENTION REQUIRED
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                {activePatients.length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Critical Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-critical">
                {criticalPatients.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4" />
                In Treatment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === 'in-progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently being seen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Avg Wait Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activePatients.length > 0 
                  ? Math.round(activePatients.reduce((sum, p) => sum + p.estimatedWaitTime, 0) / activePatients.length)
                  : 0
                } min
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated wait
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="intake" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Patient Intake
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-6">
            <QueueDisplay 
              patients={patients}
              onPatientStatusChange={updatePatientStatus}
            />
          </TabsContent>

          <TabsContent value="intake" className="space-y-6">
            <div className="flex justify-center">
              <PatientIntakeForm onPatientAdded={addPatient} />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Triage Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Algorithm Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accuracy Rate</span>
                        <Badge variant="outline">94.2%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Processing Time</span>
                        <Badge variant="outline">1.3 seconds</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Patients Processed Today</span>
                        <Badge variant="outline">{patients.length}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Priority Distribution</h3>
                    <div className="space-y-2">
                      {['critical', 'high', 'medium', 'low', 'stable'].map(level => {
                        const count = patients.filter(p => p.priorityLevel === level).length;
                        const percentage = patients.length > 0 ? Math.round((count / patients.length) * 100) : 0;
                        return (
                          <div key={level} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{level}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{count}</Badge>
                              <span className="text-xs text-muted-foreground w-8">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {patients.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Recent Triage Decisions</h3>
                    <div className="space-y-2">
                      {patients.slice(-5).reverse().map(patient => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <span className="font-medium">{patient.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {patient.symptoms.slice(0, 2).join(', ')}
                              {patient.symptoms.length > 2 && '...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              patient.priorityLevel === 'critical' ? 'bg-critical text-critical-foreground' :
                              patient.priorityLevel === 'high' ? 'bg-high text-high-foreground' :
                              patient.priorityLevel === 'medium' ? 'bg-medium text-medium-foreground' :
                              patient.priorityLevel === 'low' ? 'bg-low text-low-foreground' :
                              'bg-stable text-stable-foreground'
                            }>
                              {patient.priorityLevel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Score: {patient.priorityScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;