// REFRESH TOKEN SERVICE - UNCOMMENT AFTER REFACTORING
import { Types } from "mongoose";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";

/**
 * RefreshTokenService handles token blacklisting and management
 * This service can be used for additional security features like
 * tracking active sessions, implementing token rotation, etc.
 */
export class RefreshTokenService {
    private static blacklistedTokens: Set<string> = new Set();
    private static userSessions: Map<string, Set<string>> = new Map();

    /**
     * Add a refresh token to the blacklist
     */
    static blacklistToken(token: string): void {
        this.blacklistedTokens.add(token);
    }

    /**
     * Check if a refresh token is blacklisted
     */
    static isTokenBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }

    /**
     * Add a session for a user
     */
    static addUserSession(userId: string, refreshToken: string): void {
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId)!.add(refreshToken);
    }

    /**
     * Remove a session for a user
     */
    static removeUserSession(userId: string, refreshToken: string): void {
        const userTokens = this.userSessions.get(userId);
        if (userTokens) {
            userTokens.delete(refreshToken);
            if (userTokens.size === 0) {
                this.userSessions.delete(userId);
            }
        }
    }

    /**
     * Remove all sessions for a user (logout from all devices)
     */
    static removeAllUserSessions(userId: string): void {
        const userTokens = this.userSessions.get(userId);
        if (userTokens) {
            // Add all user tokens to blacklist
            userTokens.forEach(token => this.blacklistToken(token));
            // Remove user sessions
            this.userSessions.delete(userId);
        }
    }

    /**
     * Get all active sessions for a user
     */
    static getUserSessions(userId: string): Set<string> {
        return this.userSessions.get(userId) || new Set();
    }

    /**
     * Clean up expired tokens from memory (should be called periodically)
     * In a production environment, you might want to use Redis or a database
     * for persistence and automatic expiration
     */
    static cleanupExpiredTokens(): void {
        // This is a simplified cleanup - in production you'd want to 
        // check actual token expiration times
        // For now, we'll just clear old tokens periodically
        if (this.blacklistedTokens.size > 10000) {
            this.blacklistedTokens.clear();
        }
    }
}

// Periodically clean up expired tokens (every 24 hours)
setInterval(() => {
    RefreshTokenService.cleanupExpiredTokens();
}, 24 * 60 * 60 * 1000);
