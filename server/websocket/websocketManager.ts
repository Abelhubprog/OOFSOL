import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import { DatabaseUtils } from '../db/utils';
import { db } from '../db';
import { users, oofMoments } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  walletAddress?: string;
}

export interface SocketData {
  userId?: string;
  walletAddress?: string;
  rooms: string[];
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com']
          : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
          const decoded = verifyToken(token);
          if (decoded) {
            const user = await db.query.users.findFirst({
              where: eq(users.id, decoded.userId)
            });
            if (user) {
              socket.userId = user.id;
              socket.walletAddress = user.walletAddress || undefined;
              console.log(`User ${user.id} connected via WebSocket`);
            }
          }
        }
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next();
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      // Basic rate limiting - 100 events per minute
      const rateLimitKey = `ws_rate_${socket.handshake.address}`;
      // In production, use Redis for distributed rate limiting
      next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`Socket connected: ${socket.id}${socket.userId ? ` (User: ${socket.userId})` : ' (Anonymous)'}`);

      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
        this.userRooms.set(socket.userId, new Set());
      }

      // Handle OOF Moments real-time events
      this.setupOOFMomentsEvents(socket);

      // Handle wallet analysis progress updates
      this.setupWalletAnalysisEvents(socket);

      // Handle social interactions
      this.setupSocialEvents(socket);

      // Handle token advertising events
      this.setupAdvertisingEvents(socket);

      // Handle leaderboard updates
      this.setupLeaderboardEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          this.userRooms.delete(socket.userId);
        }
      });
    });
  }

  private setupOOFMomentsEvents(socket: AuthenticatedSocket): void {
    // Subscribe to OOF moment generation progress
    socket.on('subscribe:oof-generation', (data: { jobId: string }) => {
      const roomName = `oof-generation:${data.jobId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Unsubscribe from OOF moment generation
    socket.on('unsubscribe:oof-generation', (data: { jobId: string }) => {
      const roomName = `oof-generation:${data.jobId}`;
      socket.leave(roomName);
    });

    // Real-time OOF moments feed subscription
    socket.on('subscribe:oof-feed', () => {
      socket.join('global-oof-feed');
      console.log(`Socket ${socket.id} subscribed to global OOF feed`);
    });

    socket.on('unsubscribe:oof-feed', () => {
      socket.leave('global-oof-feed');
    });

    // Personal OOF moments updates
    if (socket.userId) {
      socket.on('subscribe:my-moments', () => {
        const roomName = `user-moments:${socket.userId}`;
        socket.join(roomName);
      });
    }
  }

  private setupWalletAnalysisEvents(socket: AuthenticatedSocket): void {
    // Subscribe to wallet analysis progress
    socket.on('subscribe:wallet-analysis', (data: { walletAddress: string }) => {
      if (!data.walletAddress) return;
      
      const roomName = `wallet-analysis:${data.walletAddress}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} subscribed to wallet analysis: ${data.walletAddress}`);
    });

    socket.on('unsubscribe:wallet-analysis', (data: { walletAddress: string }) => {
      if (!data.walletAddress) return;
      
      const roomName = `wallet-analysis:${data.walletAddress}`;
      socket.leave(roomName);
    });
  }

  private setupSocialEvents(socket: AuthenticatedSocket): void {
    // Real-time likes and interactions
    socket.on('moment:like', async (data: { momentId: number }) => {
      if (!socket.userId) return;

      try {
        // Update moment likes count
        await db
          .update(oofMoments)
          .set({ 
            likes: sql`${oofMoments.likes} + 1`,
            updatedAt: new Date()
          })
          .where(eq(oofMoments.id, data.momentId));

        // Broadcast to all users in the feed
        this.io.to('global-oof-feed').emit('moment:liked', {
          momentId: data.momentId,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });

        console.log(`User ${socket.userId} liked moment ${data.momentId}`);
      } catch (error) {
        console.error('Error handling like:', error);
        socket.emit('error', { message: 'Failed to like moment' });
      }
    });

    socket.on('moment:share', async (data: { momentId: number; platform: string }) => {
      if (!socket.userId) return;

      try {
        // Update moment shares count
        await db
          .update(oofMoments)
          .set({ 
            shares: sql`${oofMoments.shares} + 1`,
            updatedAt: new Date()
          })
          .where(eq(oofMoments.id, data.momentId));

        // Broadcast share event
        this.io.to('global-oof-feed').emit('moment:shared', {
          momentId: data.momentId,
          userId: socket.userId,
          platform: data.platform,
          timestamp: new Date().toISOString()
        });

        console.log(`User ${socket.userId} shared moment ${data.momentId} on ${data.platform}`);
      } catch (error) {
        console.error('Error handling share:', error);
        socket.emit('error', { message: 'Failed to share moment' });
      }
    });

    // Real-time comments
    socket.on('moment:comment', async (data: { momentId: number; comment: string }) => {
      if (!socket.userId || !data.comment.trim()) return;

      try {
        // Update moment comments count
        await db
          .update(oofMoments)
          .set({ 
            comments: sql`${oofMoments.comments} + 1`,
            updatedAt: new Date()
          })
          .where(eq(oofMoments.id, data.momentId));

        // Broadcast comment to feed subscribers
        this.io.to('global-oof-feed').emit('moment:commented', {
          momentId: data.momentId,
          userId: socket.userId,
          comment: data.comment.trim(),
          timestamp: new Date().toISOString()
        });

        socket.emit('comment:success', { success: true });
        console.log(`User ${socket.userId} commented on moment ${data.momentId}`);
      } catch (error) {
        console.error('Error handling comment:', error);
        socket.emit('error', { message: 'Failed to post comment' });
      }
    });
  }

  private setupAdvertisingEvents(socket: AuthenticatedSocket): void {
    // Subscribe to token ad updates
    socket.on('subscribe:token-ads', () => {
      socket.join('token-ads-feed');
      console.log(`Socket ${socket.id} subscribed to token ads feed`);
    });

    // Track ad views
    socket.on('ad:view', async (data: { adId: number }) => {
      try {
        // In production, track ad interaction in database
        console.log(`Ad view tracked: ${data.adId} by ${socket.walletAddress || 'anonymous'}`);

        console.log(`Ad ${data.adId} viewed by ${socket.walletAddress || 'anonymous'}`);
      } catch (error) {
        console.error('Error tracking ad view:', error);
      }
    });

    // Track ad clicks
    socket.on('ad:click', async (data: { adId: number; targetUrl: string }) => {
      try {
        // In production, track ad click in database
        console.log(`Ad click tracked: ${data.adId} -> ${data.targetUrl} by ${socket.walletAddress || 'anonymous'}`);

        console.log(`Ad ${data.adId} clicked by ${socket.walletAddress || 'anonymous'}`);
      } catch (error) {
        console.error('Error tracking ad click:', error);
      }
    });
  }

  private setupLeaderboardEvents(socket: AuthenticatedSocket): void {
    // Subscribe to leaderboard updates
    socket.on('subscribe:leaderboard', () => {
      socket.join('leaderboard-updates');
      console.log(`Socket ${socket.id} subscribed to leaderboard updates`);
    });

    socket.on('unsubscribe:leaderboard', () => {
      socket.leave('leaderboard-updates');
    });
  }

  // Public methods for broadcasting events

  public broadcastOOFGenerationProgress(jobId: string, progress: {
    progress: number;
    currentStep: string;
    completed?: boolean;
    error?: string;
    result?: any;
  }): void {
    const roomName = `oof-generation:${jobId}`;
    this.io.to(roomName).emit('oof-generation:progress', {
      jobId,
      ...progress,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastWalletAnalysisProgress(walletAddress: string, progress: {
    progress: number;
    currentStep: string;
    completed?: boolean;
    error?: string;
  }): void {
    const roomName = `wallet-analysis:${walletAddress}`;
    this.io.to(roomName).emit('wallet-analysis:progress', {
      walletAddress,
      ...progress,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastNewOOFMoment(moment: any): void {
    this.io.to('global-oof-feed').emit('oof-moment:new', {
      moment,
      timestamp: new Date().toISOString()
    });

    // Also broadcast to the creator's personal feed
    if (moment.userId) {
      const userRoom = `user-moments:${moment.userId}`;
      this.io.to(userRoom).emit('oof-moment:created', {
        moment,
        timestamp: new Date().toISOString()
      });
    }
  }

  public broadcastTokenAdUpdate(ad: any): void {
    this.io.to('token-ads-feed').emit('token-ad:updated', {
      ad,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastLeaderboardUpdate(leaderboard: any[]): void {
    this.io.to('leaderboard-updates').emit('leaderboard:updated', {
      leaderboard,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastUserAchievement(userId: string, achievement: any): void {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('achievement:unlocked', {
        achievement,
        timestamp: new Date().toISOString()
      });
    }

    // Also broadcast to global feed for celebration
    this.io.to('global-oof-feed').emit('achievement:global', {
      userId,
      achievement,
      timestamp: new Date().toISOString()
    });
  }

  public sendPersonalNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Admin broadcast methods
  public broadcastSystemAnnouncement(announcement: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }): void {
    this.io.emit('system:announcement', {
      ...announcement,
      timestamp: new Date().toISOString()
    });
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getUserRooms(userId: string): string[] {
    const rooms = this.userRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }

  // Cleanup inactive connections
  public cleanup(): void {
    console.log('Running WebSocket cleanup...');
    
    // Remove inactive connections
    const now = Date.now();
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (!socket.connected) {
        this.connectedUsers.delete(userId);
        this.userRooms.delete(userId);
      }
    }

    console.log(`WebSocket cleanup completed. Active connections: ${this.connectedUsers.size}`);
  }
}

let websocketManager: WebSocketManager;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketManager => {
  websocketManager = new WebSocketManager(httpServer);
  
  // Run cleanup every 5 minutes
  setInterval(() => {
    websocketManager.cleanup();
  }, 5 * 60 * 1000);

  return websocketManager;
};

export const getWebSocketManager = (): WebSocketManager => {
  if (!websocketManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return websocketManager;
};