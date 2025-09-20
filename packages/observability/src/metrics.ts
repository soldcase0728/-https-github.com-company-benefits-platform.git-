export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.ENABLE_METRICS === 'true') {
      console.log(`Metric: ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
    }
  });
  
  next();
}
