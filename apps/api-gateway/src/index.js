


const express = require('express');
const app = express();
const PORT = 4000;

// Serve HTML on root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Benefits Platform</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .status { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏥 Benefits Platform</h1>
        <div class="status">
          <h2>✅ System Status: Healthy</h2>
          <p>API Server is running</p>
        </div>
        <h3>Available Endpoints:</h3>
        <div class="endpoint">GET /health - Check system health</div>
        <div class="endpoint">GET /api/plans - View benefit plans</div>
      </div>
    </body>
    </html>
  `);
});

// Benefits page that fetches and displays the plans
app.get('/benefits', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Benefit Plans</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .plans { display: grid; gap: 20px; margin-top: 20px; }
        .plan { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .plan h3 { margin: 0 0 10px 0; color: #2196F3; }
        .price { font-size: 24px; font-weight: bold; color: #4CAF50; }
        button { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #1976D2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Available Benefit Plans</h1>
        <div class="plans" id="plans">Loading...</div>
      </div>
      <script>
        fetch('/api/plans')
          .then(res => res.json())
          .then(plans => {
            const container = document.getElementById('plans');
            container.innerHTML = plans.map(function(plan) {
              return '<div class="plan">' +
                '<h3>' + plan.name + '</h3>' +
                '<div class="price">$' + plan.price + '/month</div>' +
                '<button onclick="alert(\'Enrolling in: ' + plan.name + '\')">Enroll Now</button>' +
              '</div>';
            }).join('');
          });
      </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Sample API endpoint
app.get('/api/plans', (req, res) => {
  res.json([
    { id: 1, name: 'Basic Health Plan', price: 100 },
    { id: 2, name: 'Premium Health Plan', price: 250 },
    { id: 3, name: 'Dental Coverage', price: 50 }
  ]);
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to see the web interface`);
});