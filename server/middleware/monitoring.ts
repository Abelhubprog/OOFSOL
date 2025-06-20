import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip: string;
  userWallet?: string;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  path: string;
  method: string;
  statusCode: number;
  timestamp: Date;
  userWallet?: string;
  requestBody?: any;
  headers?: any;
}

export class MonitoringService {
  private static metrics: RequestMetrics[] = [];
  private static errors: ErrorLog[] = [];
  private static readonly MAX_METRICS = 10000;
  private static readonly MAX_ERRORS = 1000;

  // 📊 Request Performance Monitoring
  static performanceMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to capture metrics
    res.end = function(...args: any[]) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Capture metrics
      const metrics: RequestMetrics = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime,
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userWallet: req.user?.walletAddress,
      };

      MonitoringService.addMetric(metrics);
      
      // Log slow requests
      if (responseTime > 5000) { // 5 seconds
        console.warn(`🐌 Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
      }

      // Log errors
      if (res.statusCode >= 400) {
        MonitoringService.logError({
          message: `HTTP ${res.statusCode}`,
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          timestamp: new Date(),
          userWallet: req.user?.walletAddress,
          requestBody: req.body,
          headers: req.headers
        });
      }

      // Call original end function
      originalEnd.apply(res, args);
    };

    next();
  }

  // 📈 Health Check Endpoint
  static healthCheck(req: Request, res: Response) {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const recentMetrics = MonitoringService.getRecentMetrics(5 * 60 * 1000); // Last 5 minutes
    
    const averageResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
      : 0;

    const errorRate = recentMetrics.length > 0
      ? (recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length) * 100
      : 0;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      performance: {
        averageResponseTime: Math.round(averageResponseTime),
        requestCount: recentMetrics.length,
        errorRate: Math.round(errorRate * 100) / 100,
      },
      database: {
        connected: true, // TODO: Add actual DB health check
      },
      services: {
        ai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
        solana: process.env.SOLANA_RPC_URL ? 'configured' : 'missing',
      }
    };

    // Determine overall health status
    if (errorRate > 10 || averageResponseTime > 5000) {
      health.status = 'degraded';
    }

    if (errorRate > 25 || averageResponseTime > 10000 || memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  }

  // 📊 Metrics Analytics
  static getMetricsAnalytics(req: Request, res: Response) {
    const { hours = 24 } = req.query;
    const timeframe = Number(hours) * 60 * 60 * 1000;
    const metrics = MonitoringService.getRecentMetrics(timeframe);

    // Group by endpoint
    const endpointStats = metrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.path}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          totalTime: 0,
          errors: 0,
          path: metric.path,
          method: metric.method
        };
      }
      acc[key].count++;
      acc[key].totalTime += metric.responseTime;
      if (metric.statusCode >= 400) acc[key].errors++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and format
    const endpoints = Object.values(endpointStats).map((stats: any) => ({
      ...stats,
      averageResponseTime: Math.round(stats.totalTime / stats.count),
      errorRate: Math.round((stats.errors / stats.count) * 100 * 100) / 100,
    })).sort((a: any, b: any) => b.count - a.count);

    // Overall stats
    const totalRequests = metrics.length;
    const totalErrors = metrics.filter(m => m.statusCode >= 400).length;
    const averageResponseTime = totalRequests > 0 
      ? Math.round(metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests)
      : 0;

    // Response time percentiles
    const sortedTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

    res.json({
      timeframe: `${hours} hours`,
      overview: {
        totalRequests,
        totalErrors,
        errorRate: Math.round((totalErrors / Math.max(totalRequests, 1)) * 100 * 100) / 100,
        averageResponseTime,
      },
      responseTimePercentiles: {
        p50,
        p95,
        p99,
      },
      endpoints: endpoints.slice(0, 20), // Top 20 endpoints
      errors: MonitoringService.getRecentErrors(timeframe).slice(0, 50), // Last 50 errors
    });
  }

  // 🚨 Error Logging
  static logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      path: error.path || 'unknown',
      method: error.method || 'unknown',
      statusCode: error.statusCode || 500,
      timestamp: new Date(),
      userWallet: error.userWallet,
      requestBody: error.requestBody,
      headers: error.headers,
    };

    MonitoringService.errors.unshift(errorLog);
    
    // Keep only recent errors
    if (MonitoringService.errors.length > MonitoringService.MAX_ERRORS) {
      MonitoringService.errors = MonitoringService.errors.slice(0, MonitoringService.MAX_ERRORS);
    }

    // Console log for development
    console.error(`🚨 Error: ${errorLog.message} - ${errorLog.method} ${errorLog.path}`);
    if (errorLog.stack) {
      console.error(errorLog.stack);
    }
  }

  // 📊 Add Metric
  private static addMetric(metric: RequestMetrics) {
    MonitoringService.metrics.unshift(metric);
    
    // Keep only recent metrics
    if (MonitoringService.metrics.length > MonitoringService.MAX_METRICS) {
      MonitoringService.metrics = MonitoringService.metrics.slice(0, MonitoringService.MAX_METRICS);
    }
  }

  // 📊 Get Recent Metrics
  private static getRecentMetrics(timeframe: number): RequestMetrics[] {
    const cutoff = new Date(Date.now() - timeframe);
    return MonitoringService.metrics.filter(m => m.timestamp >= cutoff);
  }

  // 🚨 Get Recent Errors
  private static getRecentErrors(timeframe: number): ErrorLog[] {
    const cutoff = new Date(Date.now() - timeframe);
    return MonitoringService.errors.filter(e => e.timestamp >= cutoff);
  }

  // 🔍 Custom Event Tracking
  static trackEvent(event: string, data?: any, userWallet?: string) {
    console.log(`📊 Event: ${event}`, {
      timestamp: new Date().toISOString(),
      userWallet,
      data
    });
    
    // In production, you'd send this to your analytics service
    // e.g., Mixpanel, Amplitude, or custom analytics
  }

  // 🎯 AI Operation Monitoring
  static trackAIOperation(operation: string, model: string, tokens: number, cost: number, success: boolean, duration: number) {
    const aiMetric = {
      operation,
      model,
      tokens,
      cost,
      success,
      duration,
      timestamp: new Date(),
    };

    console.log(`🤖 AI Operation: ${operation}`, aiMetric);
    
    // Track AI costs and usage
    MonitoringService.trackEvent('ai_operation', aiMetric);
  }

  // 💰 Business Metrics Tracking
  static trackBusinessMetric(metric: string, value: number, metadata?: any) {
    const businessMetric = {
      metric,
      value,
      metadata,
      timestamp: new Date(),
    };

    console.log(`💰 Business Metric: ${metric} = ${value}`, businessMetric);
    MonitoringService.trackEvent('business_metric', businessMetric);
  }
}

// Global error handler middleware
export const globalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  MonitoringService.logError({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    statusCode: 500,
    userWallet: req.user?.walletAddress,
    requestBody: req.body,
    headers: req.headers,
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
};

// Graceful shutdown handler
export const gracefulShutdown = (signal: string) => {
  console.log(`📊 Received ${signal}, starting graceful shutdown...`);
  
  // Log final metrics
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  console.log(`📊 Final Stats - Uptime: ${Math.floor(uptime)}s, Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`📊 Total Requests: ${MonitoringService.metrics.length}`);
  console.log(`📊 Total Errors: ${MonitoringService.errors.length}`);
  
  process.exit(0);
};

// Setup process handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));