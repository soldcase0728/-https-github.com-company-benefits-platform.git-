import React from 'react';
import { ProgressBar } from '@benefits/ui';

const steps = ['Select', 'Dependents', 'Review', 'Submit'];

export default function Enrollment() {
  const [currentStep, setCurrentStep] = React.useState(0);

  return (
    <div>
      <h2>Enrollment</h2>
      <ProgressBar value={((currentStep + 1) / steps.length) * 100} />
      <ol>
        {steps.map((step, idx) => (
          <li key={step} style={{ fontWeight: idx === currentStep ? 'bold' : 'normal' }}>
            {step}
          </li>
        ))}
      </ol>
      <button disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)}>Back</button>
      <button disabled={currentStep === steps.length - 1} onClick={() => setCurrentStep(s => s + 1)}>Next</button>
    </div>
  );
}
