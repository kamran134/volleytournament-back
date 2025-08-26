#!/bin/bash
# Script to update all route files to use refresh token middleware

# Update location.routes.ts
sed -i 's/checkAdminRole/checkAdminRoleWithRefreshToken/g' src/routes/location.routes.ts
sed -i 's/import { checkAdminRoleWithRefreshToken }/import { checkAdminRoleWithRefreshToken }/g' src/routes/location.routes.ts

# Update gamer.routes.ts  
sed -i 's/checkAdminRole/checkAdminRoleWithRefreshToken/g' src/routes/gamer.routes.ts
sed -i 's/checkAdminCoachCaptainRole/checkAdminCoachCaptainRoleWithRefreshToken/g' src/routes/gamer.routes.ts
sed -i 's/checkUserRole/checkUserRoleWithRefreshToken/g' src/routes/gamer.routes.ts

# Update game.routes.ts
sed -i 's/checkAdminRole/checkAdminRoleWithRefreshToken/g' src/routes/game.routes.ts

echo "Route files updated to use refresh token middleware"
