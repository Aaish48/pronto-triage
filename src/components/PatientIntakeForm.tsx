import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/triage';
import { TriageAI } from '@/utils/triageAI';
import { useToast } from '@/hooks/use-toast';
import { Heart, AlertTriangle, Clock, User } from 'lucide-react';

interface PatientIntakeFormProps {
  onPatientAdded: (patient: Patient) => void;
}

const commonSymptoms = [
  'Chest pain', 'Difficulty breathing', 'Severe bleeding', 'Severe pain',
  'High fever', 'Nausea', 'Headache', 'Cough', 'Dizziness',
  'Abdominal pain', 'Broken bone', 'Deep cut', 'Vomiting',
  'Cold symptoms', 'Sore throat', 'Rash', 'Minor ache'
];

export default function PatientIntakeForm({ onPatientAdded }: PatientIntakeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    description: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    oxygenSaturation: ''
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || selectedSymptoms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide patient name, age, and at least one symptom.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build vital signs object
      const vitalSigns = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        bloodPressure: formData.bloodPressure || undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : undefined
      };

      // Get AI triage assessment
      const triageResult = TriageAI.calculateTriage(
        selectedSymptoms,
        parseInt(formData.age),
        formData.description,
        vitalSigns
      );

      // Create patient object
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name,
        age: parseInt(formData.age),
        symptoms: selectedSymptoms,
        description: formData.description,
        vitalSigns,
        timestamp: new Date(),
        priorityScore: triageResult.priorityScore,
        priorityLevel: triageResult.priorityLevel,
        estimatedWaitTime: triageResult.estimatedWaitTime,
        status: 'waiting'
      };

      onPatientAdded(newPatient);

      // Show success toast with triage result
      toast({
        title: "Patient Added Successfully",
        description: `${newPatient.name} assigned ${triageResult.priorityLevel.toUpperCase()} priority (Score: ${triageResult.priorityScore})`,
        variant: triageResult.priorityLevel === 'critical' ? 'destructive' : 'default'
      });

      // Reset form
      setFormData({
        name: '', age: '', description: '', temperature: '',
        bloodPressure: '', heartRate: '', oxygenSaturation: ''
      });
      setSelectedSymptoms([]);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process patient intake. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Patient Intake Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Age in years"
                min="0"
                max="120"
                required
              />
            </div>
          </div>

          {/* Symptoms Selection */}
          <div className="space-y-3">
            <Label>Symptoms * (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonSymptoms.map(symptom => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={symptom} className="text-sm cursor-pointer">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedSymptoms.map(symptom => (
                  <Badge key={symptom} variant="outline" className="cursor-pointer"
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    {symptom} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe symptoms, pain level, when they started, etc."
              rows={3}
            />
          </div>

          {/* Vital Signs */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Vital Signs (if available)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-sm">Temperature °F</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                  placeholder="98.6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure" className="text-sm">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                  placeholder="120/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate" className="text-sm">Heart Rate</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                  placeholder="72"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation" className="text-sm">O2 Sat %</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                  placeholder="98"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Add Patient to Queue
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}