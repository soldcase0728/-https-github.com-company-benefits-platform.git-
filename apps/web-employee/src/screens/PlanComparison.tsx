import React from 'react';
import { Table, Slider, Badge } from '@benefits/ui';

export default function PlanComparison() {
  // Placeholder data
  const plans = [
    { name: 'Plan A', premium: 100 },
    { name: 'Plan B', premium: 120 },
  ];

  return (
    <div>
      <h2>Plan Comparison</h2>
      <section>
        <h3>Side-by-Side</h3>
        <Table data={plans} />
      </section>
      <section>
        <h3>Cost Calculator</h3>
        <Slider min={0} max={500} />
      </section>
      <section>
        <h3>AI Recommendation</h3>
        <Badge>Recommended: Plan A</Badge>
      </section>
    </div>
  );
}
