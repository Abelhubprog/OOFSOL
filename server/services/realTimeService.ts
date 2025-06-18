import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

interface RealTimeMessage {
  type: 'generation_progress' | 'new_moment' | 'interaction_update' | 'error';
  data: any;
  timestamp: number;
}

export class RealTimeService {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Add any authentication logic here if needed
        return true;
      }
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      const client: ClientConnection = {
        id: clientId,
        ws,
        subscriptions: new Set()
      };

      this.clients.set(clientId, client);
      console.log(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        data: { clientId, message: 'Connected to OOF Moments real-time service' },
        timestamp: Date.now()
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.channel) {
          client.subscriptions.add(message.channel);
          console.log(`Client ${clientId} subscribed to ${message.channel}`);
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          client.subscriptions.delete(message.channel);
          console.log(`Client ${clientId} unsubscribed from ${message.channel}`);
        }
        break;

      case 'authenticate':
        client.userId = message.userId;
        console.log(`Client ${clientId} authenticated as user ${message.userId}`);
        break;

      default:
        console.log(`Unknown message type from client ${clientId}:`, message.type);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToClient(clientId: string, message: RealTimeMessage) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Broadcast to all clients subscribed to a channel
  broadcast(channel: string, message: Omit<RealTimeMessage, 'timestamp'>) {
    const fullMessage: RealTimeMessage = {
      ...message,
      timestamp: Date.now()
    };

    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(fullMessage));
      }
    });
  }

  // Send generation progress updates
  broadcastGenerationProgress(walletAddress: string, progress: any) {
    this.broadcast('generation_progress', {
      type: 'generation_progress',
      data: {
        walletAddress,
        ...progress
      }
    });
  }

  // Broadcast new OOF moment to community feed
  broadcastNewMoment(moment: any) {
    this.broadcast('community_feed', {
      type: 'new_moment',
      data: moment
    });
  }

  // Broadcast social interaction updates
  broadcastInteractionUpdate(momentId: number, interactionType: string, stats: any) {
    this.broadcast('social_interactions', {
      type: 'interaction_update',
      data: {
        momentId,
        interactionType,
        stats
      }
    });
  }

  // Send private messages to specific user
  sendToUser(userId: string, message: Omit<RealTimeMessage, 'timestamp'>) {
    const fullMessage: RealTimeMessage = {
      ...message,
      timestamp: Date.now()
    };

    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(fullMessage));
      }
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Get clients subscribed to a channel
  getSubscribersCount(channel: string): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel)) {
        count++;
      }
    });
    return count;
  }
}

let realTimeServiceInstance: RealTimeService | null = null;

export function initializeRealTimeService(server: Server): RealTimeService {
  if (!realTimeServiceInstance) {
    realTimeServiceInstance = new RealTimeService(server);
  }
  return realTimeServiceInstance;
}

export function getRealTimeService(): RealTimeService | null {
  return realTimeServiceInstance;
}