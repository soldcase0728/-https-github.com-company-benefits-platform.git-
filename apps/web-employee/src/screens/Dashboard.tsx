import React from 'react';
import { Card, Alert, Button } from '@benefits/ui';

export default function Dashboard() {
  // Placeholder data
  const currentCoverage = [<Card key="1">Medical</Card>, <Card key="2">Dental</Card>];
  const actionItems = [<Alert key="1">Submit missing document</Alert>];
  const quickActions = [<Button key="1">Enroll Now</Button>];

  return (
    <div>
      <h2>Dashboard</h2>
      <section>
        <h3>Current Coverage</h3>
        <div>{currentCoverage}</div>
      </section>
      <section>
        <h3>Action Items</h3>
        <div>{actionItems}</div>
      </section>
      <section>
        <h3>Quick Actions</h3>
        <div>{quickActions}</div>
      </section>
    </div>
  );
}
