import { TriageResult, Patient } from '@/types/triage';

// Mock AI Triage Algorithm - In production, this would connect to a real AI service
export class TriageAI {
  private static symptomWeights = {
    // Critical symptoms
    'chest pain': 95,
    'difficulty breathing': 90,
    'severe bleeding': 95,
    'unconscious': 100,
    'stroke symptoms': 95,
    'severe head injury': 90,
    'heart attack': 100,
    'anaphylaxis': 95,
    
    // High priority symptoms
    'severe pain': 75,
    'high fever': 70,
    'vomiting blood': 85,
    'severe abdominal pain': 75,
    'broken bone': 65,
    'deep cut': 70,
    
    // Medium priority symptoms
    'moderate pain': 50,
    'fever': 45,
    'nausea': 30,
    'headache': 35,
    'cough': 25,
    'minor cut': 20,
    
    // Low priority symptoms
    'cold symptoms': 15,
    'minor ache': 10,
    'rash': 20,
    'sore throat': 15,
    
    // Stable/routine
    'checkup': 5,
    'prescription refill': 5,
    'vaccination': 10
  };

  private static ageFactors = {
    infant: 1.3,    // 0-2 years
    child: 1.2,     // 3-12 years  
    teen: 1.0,      // 13-17 years
    adult: 1.0,     // 18-64 years
    senior: 1.2     // 65+ years
  };

  static calculateTriage(symptoms: string[], age: number, description: string, vitalSigns?: any): TriageResult {
    let baseScore = 0;
    const reasoning: string[] = [];

    // Calculate symptom score
    symptoms.forEach(symptom => {
      const weight = this.symptomWeights[symptom.toLowerCase()] || 20;
      baseScore += weight;
      if (weight >= 85) {
        reasoning.push(`Critical symptom detected: ${symptom}`);
      } else if (weight >= 60) {
        reasoning.push(`High priority symptom: ${symptom}`);
      }
    });

    // Age factor
    let ageFactor = 1.0;
    if (age <= 2) ageFactor = this.ageFactors.infant;
    else if (age <= 12) ageFactor = this.ageFactors.child;
    else if (age <= 17) ageFactor = this.ageFactors.teen;
    else if (age <= 64) ageFactor = this.ageFactors.adult;
    else ageFactor = this.ageFactors.senior;

    if (ageFactor > 1.0) {
      reasoning.push(`Age factor applied (${age} years old)`);
    }

    // Vital signs impact
    if (vitalSigns) {
      if (vitalSigns.temperature && vitalSigns.temperature > 103) {
        baseScore += 25;
        reasoning.push('High fever detected in vital signs');
      }
      if (vitalSigns.heartRate && (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50)) {
        baseScore += 20;
        reasoning.push('Abnormal heart rate detected');
      }
      if (vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation < 90) {
        baseScore += 30;
        reasoning.push('Low oxygen saturation detected');
      }
    }

    // Description analysis (simple keyword matching)
    const urgentKeywords = ['severe', 'can\'t breathe', 'unconscious', 'bleeding heavily'];
    urgentKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        baseScore += 20;
        reasoning.push(`Urgent keyword detected: ${keyword}`);
      }
    });

    const finalScore = Math.min(100, baseScore * ageFactor);

    // Determine priority level
    let priorityLevel: Patient['priorityLevel'];
    let estimatedWaitTime: number;

    if (finalScore >= 85) {
      priorityLevel = 'critical';
      estimatedWaitTime = 0;
      reasoning.push('IMMEDIATE ATTENTION REQUIRED');
    } else if (finalScore >= 65) {
      priorityLevel = 'high';
      estimatedWaitTime = 15;
      reasoning.push('High priority - see within 15 minutes');
    } else if (finalScore >= 35) {
      priorityLevel = 'medium';
      estimatedWaitTime = 60;
      reasoning.push('Medium priority - target 1 hour wait');
    } else if (finalScore >= 15) {
      priorityLevel = 'low';
      estimatedWaitTime = 120;
      reasoning.push('Low priority - target 2 hour wait');
    } else {
      priorityLevel = 'stable';
      estimatedWaitTime = 180;
      reasoning.push('Stable condition - routine care');
    }

    return {
      priorityScore: Math.round(finalScore),
      priorityLevel,
      estimatedWaitTime,
      reasoning
    };
  }
}