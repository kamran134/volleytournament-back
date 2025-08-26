# REFRESH TOKEN IMPLEMENTATION GUIDE

## Overview
This guide explains how to implement refresh token functionality in the volleyball tournament backend. All the code has been added as comments and needs to be uncommented and tested after refactoring.

## Files Modified/Created

### 1. Core Model Changes
- **`src/models/user.model.ts`**: Added refreshToken and refreshTokenExpiresAt fields
- **`src/interfaces/auth.dto.ts`**: Added RefreshTokenDto class

### 2. JWT Utilities Enhanced
- **`src/utils/jwt.utils.ts`**: Added refresh token signing and verification functions

### 3. Services Enhanced
- **`src/services/auth.service.ts`**: Added comprehensive refresh token management
- **`src/services/refreshToken.service.ts`**: New service for token blacklisting and session management

### 4. Business Logic Enhanced
- **`src/business/auth/auth.usecase.ts`**: Added refresh token use cases

### 5. Controllers Enhanced
- **`src/controllers/auth.controller.ts`**: Added refresh token endpoints

### 6. Middleware Enhanced
- **`src/middleware/auth.middleware.ts`**: Added refresh token middleware options

### 7. Routes Enhanced
- **`src/routes/auth.routes.ts`**: Added refresh token routes

### 8. Constants Enhanced
- **`src/constants/messages.ts`**: Added refresh token error messages

## Implementation Steps

### Step 1: Environment Setup
1. Add the following environment variables to your `.env` file:
   ```
   JWT_REFRESH_SECRET=your-different-secret-key-for-refresh-tokens
   ```
2. Ensure JWT_REFRESH_SECRET is different from JWT_SECRET
3. Use cryptographically secure random strings (min 32 characters)

### Step 2: Database Migration
The refresh token fields are optional, so existing users will continue to work. New fields will be populated when users log in with the new system.

### Step 3: Uncomment Code
Systematically uncomment the code in the following order:

1. **Models**: `src/models/user.model.ts`
2. **DTOs**: `src/interfaces/auth.dto.ts`
3. **JWT Utils**: `src/utils/jwt.utils.ts`
4. **Constants**: `src/constants/messages.ts`
5. **Services**: `src/services/refreshToken.service.ts` (entire file)
6. **Auth Service**: `src/services/auth.service.ts`
7. **Use Cases**: `src/business/auth/auth.usecase.ts`
8. **Controllers**: `src/controllers/auth.controller.ts`
9. **Middleware**: `src/middleware/auth.middleware.ts`
10. **Routes**: `src/routes/auth.routes.ts`

### Step 4: Testing
Test the following endpoints after implementation:

1. **POST /auth/login-refresh**: Login with refresh token generation
2. **POST /auth/refresh-token**: Refresh access token using refresh token
3. **POST /auth/logout-refresh**: Logout with refresh token revocation
4. **POST /auth/logout-all**: Logout from all devices

## New API Endpoints

### POST /auth/login-refresh
Login and receive both access and refresh tokens
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Uğurlu avtorizasiya",
  "accessToken": "short-lived-access-token",
  "refreshToken": "long-lived-refresh-token",
  "user": { ... }
}
```

### POST /auth/refresh-token
Refresh access token using refresh token
```json
{
  "refreshToken": "existing-refresh-token"
}
```

Response:
```json
{
  "message": "Token uğurla yeniləndi",
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### POST /auth/logout-refresh
Logout and revoke refresh token (requires authentication)
Response:
```json
{
  "message": "Sistemdən çıxdınız"
}
```

### POST /auth/logout-all
Logout from all devices (requires authentication)
Response:
```json
{
  "message": "Sistemdən çıxdınız"
}
```

## Security Features Implemented

1. **Token Rotation**: Each refresh generates new access and refresh tokens
2. **Token Blacklisting**: Old refresh tokens are blacklisted when refreshed
3. **Session Tracking**: Track active sessions per user
4. **Automatic Cleanup**: Periodic cleanup of expired tokens
5. **Multiple Device Support**: Users can have multiple active sessions
6. **Logout All Devices**: Ability to revoke all sessions for a user

## Token Lifecycle

1. **Login**: User receives both access token (15min) and refresh token (7 days)
2. **API Requests**: Use access token for API requests
3. **Token Refresh**: When access token expires, use refresh token to get new tokens
4. **Token Rotation**: Each refresh invalidates old tokens and issues new ones
5. **Logout**: Refresh token is blacklisted and removed from session tracking

## Migration Strategy

### Phase 1: Backward Compatibility
- Keep existing `/auth/login` endpoint working
- Introduce new `/auth/login-refresh` endpoint
- Clients can gradually migrate to new endpoints

### Phase 2: Full Migration
- Update client applications to use refresh tokens
- Implement automatic token refresh in client-side interceptors
- Test all authentication flows

### Phase 3: Deprecation (Optional)
- After all clients migrate, optionally deprecate old login endpoint
- Add sunset headers to old endpoints

## Error Handling

New error types added:
- `INVALID_REFRESH_TOKEN`: Refresh token is invalid or expired
- `REFRESH_TOKEN_REQUIRED`: Refresh token not provided
- `REFRESH_TOKEN_EXPIRED`: Refresh token has expired
- `REFRESH_TOKEN_NOT_FOUND`: Refresh token not found in database

## Performance Considerations

1. **Memory Usage**: In-memory blacklisting is used for demo - consider Redis for production
2. **Database Queries**: Efficient indexing on refreshToken field recommended
3. **Token Cleanup**: Periodic cleanup prevents memory bloat
4. **Session Limits**: Consider implementing maximum sessions per user

## Production Recommendations

1. **Use Redis**: Replace in-memory blacklisting with Redis for scaling
2. **Database Indexing**: Index refreshToken and refreshTokenExpiresAt fields
3. **Token Rotation**: Implement sliding window refresh token rotation
4. **Monitoring**: Monitor token refresh rates and failed attempts
5. **Rate Limiting**: Add rate limiting to refresh endpoint
6. **Audit Logging**: Log all authentication events for security monitoring

## Client-Side Implementation Example

```javascript
// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const response = await axios.post('/auth/refresh-token');
        // Retry original request with new token
        return axios(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Troubleshooting

Common issues and solutions:

1. **JWT_REFRESH_SECRET not found**: Ensure environment variable is set
2. **Token rotation issues**: Check that old tokens are properly blacklisted
3. **Memory leaks**: Ensure periodic cleanup is running
4. **Database performance**: Index refresh token fields
5. **Client sync issues**: Implement proper error handling for token refresh failures
