# REFRESH TOKEN ENVIRONMENT VARIABLES - UNCOMMENT AFTER REFACTORING
# Add these environment variables to your .env file

# JWT_SECRET=your-existing-jwt-secret-for-access-tokens
# JWT_REFRESH_SECRET=your-separate-jwt-secret-for-refresh-tokens-should-be-different-from-jwt-secret

# Example:
# JWT_SECRET=your-super-secret-access-token-key-min-32-chars
# JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-different-from-access-token-min-32-chars

# IMPORTANT SECURITY NOTES:
# 1. JWT_REFRESH_SECRET must be different from JWT_SECRET
# 2. Both secrets should be at least 32 characters long
# 3. Use cryptographically secure random strings
# 4. Never commit these secrets to version control
# 5. Rotate secrets periodically in production

# You can generate secure secrets using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
