import { Router } from 'express';
import { authRateLimit, generalRateLimit } from '../middleware/auth';

export function createSimpleRoutes(): Router {
  const router = Router();

  // Health check route
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV
    });
  });

  // Simple test route for OOF moments
  router.get('/oof-moments', generalRateLimit, (req, res) => {
    res.json({
      message: 'OOF Moments API endpoint',
      status: 'working',
      data: []
    });
  });

  // Simple auth test route
  router.post('/auth/test', authRateLimit, (req, res) => {
    res.json({
      message: 'Auth endpoint working',
      status: 'success'
    });
  });

  // Simple wallet analysis test
  router.get('/wallet/:address', generalRateLimit, (req, res) => {
    const { address } = req.params;
    res.json({
      message: 'Wallet analysis endpoint',
      walletAddress: address,
      status: 'working'
    });
  });

  return router;
}