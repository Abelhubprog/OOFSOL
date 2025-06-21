import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { DatabaseUtils } from '../db/utils';
import { generateToken, JWT_SECRET, AuthenticatedRequest } from '../middleware/auth'; // Assuming JWT_SECRET is also needed here for robust auth logic if any
import jwt from 'jsonwebtoken';

interface UserProfile extends Omit<User, 'emailVerified' | 'hashedPassword' | 'createdAt' | 'updatedAt'> {
  // Define what subset of User data is okay to return to client
  id: string;
  walletAddress: string | null;
  username: string | null;
  email?: string | null;
  profileImageUrl?: string | null;
  oofTokens?: number | null;
  oofScore?: number | null;
  // Add any other fields that are safe and useful for the client
}

export class AuthService {
  public static async getOrCreateUserFromWallet(walletAddress: string, userData?: Partial<User>): Promise<UserProfile | null> {
    if (!walletAddress) {
      throw new Error('Wallet address is required.');
    }

    let user = await DatabaseUtils.getUserByWallet(walletAddress);

    if (!user) {
      const newUserPartial: Partial<User> = {
        walletAddress: walletAddress,
        username: userData?.username || `user_${walletAddress.slice(-6)}`,
        email: userData?.email,
        profileImageUrl: userData?.profileImageUrl,
        oofTokens: 100, // Initial OOF tokens
        oofScore: 0,
        ...userData, // Spread any other provided data
      };
      user = await DatabaseUtils.createOrUpdateUser(walletAddress, newUserPartial);
    } else if (userData && Object.keys(userData).length > 0) {
      // Optionally update existing user if new data is provided
      user = await DatabaseUtils.createOrUpdateUser(walletAddress, userData);
    }

    if (!user) return null;

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      oofTokens: user.oofTokens,
      oofScore: user.oofScore,
    };
  }

  public static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await DatabaseUtils.getUserById(userId);
    if (!user) return null;

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      oofTokens: user.oofTokens,
      oofScore: user.oofScore,
    };
  }

  /**
   * This method would be used if the backend is responsible for issuing its own JWTs
   * after Dynamic.xyz authentication, perhaps by verifying a token from Dynamic.
   * For now, it's simplified.
   */
  public static async handleDynamicAuth(dynamicJwtPayload: any): Promise<{ userProfile: UserProfile, appToken: string } | null> {
    // In a real scenario, you would:
    // 1. Verify the JWT from Dynamic.xyz (e.g., using their SDK or a public key)
    // 2. Extract verified user information (like wallet address, email)
    const walletAddress = dynamicJwtPayload.verified_credentials?.[0]?.address; // Example path
    const email = dynamicJwtPayload.email;

    if (!walletAddress) {
      console.error("No wallet address found in Dynamic.xyz payload");
      return null;
    }

    // Get or create user in our database
    const userProfileData = await this.getOrCreateUserFromWallet(walletAddress, { email });
    if (!userProfileData) {
      console.error("Failed to get or create user profile for wallet:", walletAddress);
      return null;
    }

    // Generate our own application JWT
    const appToken = generateToken(userProfileData.id, userProfileData.walletAddress || undefined);

    return { userProfile: userProfileData, appToken };
  }

  // New method to handle user data from a verified JWT (issued by our app)
  public static async getUserByVerifiedToken(req: AuthenticatedRequest): Promise<UserProfile | null> {
    if (!req.user || !req.user.id) {
      // This case should ideally be caught by authenticateUser middleware
      return null;
    }
    return this.getUserProfile(req.user.id);
  }
}
