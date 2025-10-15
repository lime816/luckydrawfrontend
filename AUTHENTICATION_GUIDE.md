# Enhanced Authentication System - Documentation

## Overview

The Lucky Draw application now features a **dual-source authentication system** that validates login credentials from two sources:

1. **Supabase Authentication/Users** - For Super Admins (checked first)
2. **Admins Table** (Database) - For regular Admins and Moderators (fallback)

This ensures secure, flexible authentication with proper role-based access control.

---

## Architecture

### Authentication Flow

```
User Login Attempt
    ↓
AuthService.login(email, password)
    ↓
    ├─→ Check Supabase Authentication First
    │   ├─→ Found & Valid? → Login Success (Super Admin)
    │   └─→ Not Found/Invalid? → Continue to next source
    │
    └─→ Check Admins Table (Database)
        ├─→ Found & Valid? → Login Success (Admin/Moderator)
        └─→ Not Found/Invalid? → Login Failed
```

### Files Modified/Created

#### **New Files:**
- `src/services/authService.ts` - Core authentication service

#### **Modified Files:**
- `src/pages/auth/Login.tsx` - Updated login page with enhanced UI
- `src/components/layout/Header.tsx` - Enhanced logout functionality

---

## Authentication Service (`authService.ts`)

### Key Methods

#### 1. `login(email: string, password: string): Promise<AuthResponse>`
Main authentication method that checks both sources sequentially.

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  source?: 'admin' | 'supabase_auth';
}
```

#### 2. `authenticateFromSupabaseAuth(email, password)`
- Uses Supabase Auth `signInWithPassword()`
- Retrieves user metadata
- Assigns SUPER_ADMIN role automatically
- Returns Supabase session token
- **Checked first** for Super Admin authentication

#### 3. `authenticateFromAdminsTable(email, password)`
- Queries the `admins` table in the database
- Verifies password (currently plain text, should use bcrypt in production)
- Updates last login timestamp
- Logs login activity
- Maps database roles to UserRole enum
- **Fallback** for regular Admin/Moderator authentication

#### 4. `getRedirectPath(role: UserRole, source?: 'admin' | 'supabase_auth'): string`
Returns the appropriate dashboard path based on user role and authentication source:
- Super Admin (from Supabase Auth) → `/dashboard` (Super Admin Dashboard)
- Admin (from Database) → `/dashboard` (Admin Dashboard)
- Moderator (from Database) → `/dashboard` (Moderator Dashboard)

#### 5. `logout(): Promise<void>`
Handles logout from both Supabase Auth and local storage.

#### 6. `verifySession(token: string): Promise<boolean>`
Validates if the current session token is still valid.

#### 7. `changePassword(userId, currentPassword, newPassword, source)`
Allows password changes for both authentication sources.

---

## Role Mapping

### Database Roles → UserRole Enum

| Database Role | UserRole Enum    | Access Level |
|---------------|------------------|--------------|
| SUPERADMIN    | SUPER_ADMIN      | Highest      |
| ADMIN         | ADMIN            | High         |
| MODERATOR     | MODERATOR        | Standard     |

---

## Login Page Enhancements

### Visual Improvements

1. **Secure Authentication Badge**
   - Blue info box explaining dual-source authentication
   - Builds user confidence in security

2. **Enhanced Error Messages**
   - Animated shake effect for errors
   - Clear, user-friendly error text

3. **Role-Based Success Messages**
   - Shows user name and role on successful login
   - Crown emoji (👑) for Super Admin
   - Party emoji (🎉) for Admin/Moderator

4. **Smooth Transitions**
   - 500ms delay before redirect for better UX
   - Loading states during authentication

---

## Security Features

### Current Implementation

✅ **Dual-Source Authentication** - Checks multiple sources
✅ **Role-Based Access Control** - Different permissions per role
✅ **Session Management** - Token-based authentication
✅ **Activity Logging** - Logs all login attempts (for Admins table)
✅ **Last Login Tracking** - Updates timestamp on successful login

### Production Recommendations

⚠️ **Password Hashing** - Currently uses plain text comparison
   - **Action Required:** Implement bcrypt or argon2 for password hashing
   - Update both `AdminService` and `AuthService`

⚠️ **Token Security** - Basic base64 encoding
   - **Action Required:** Use JWT with proper signing
   - Implement token expiration and refresh

⚠️ **Rate Limiting** - No current implementation
   - **Action Required:** Add rate limiting to prevent brute force attacks

⚠️ **Two-Factor Authentication** - Database field exists but not enforced
   - **Action Required:** Implement 2FA flow for enhanced security

---

## Usage Examples

### Basic Login

```typescript
import { AuthService } from '../services/authService';

const handleLogin = async (email: string, password: string) => {
  const response = await AuthService.login(email, password);
  
  if (response.success && response.user && response.token) {
    // Store in auth store
    login(response.user, response.token);
    
    // Redirect based on role
    const path = AuthService.getRedirectPath(response.user.role);
    navigate(path);
  } else {
    // Show error
    setError(response.error || 'Login failed');
  }
};
```

### Logout

```typescript
import { AuthService } from '../services/authService';

const handleLogout = async () => {
  await AuthService.logout();
  logout(); // Clear local state
  navigate('/login');
};
```

### Session Verification

```typescript
import { AuthService } from '../services/authService';

const checkSession = async (token: string) => {
  const isValid = await AuthService.verifySession(token);
  
  if (!isValid) {
    // Session expired, redirect to login
    logout();
    navigate('/login');
  }
};
```

---

## Testing Scenarios

### Test Case 1: Super Admin Login (Supabase Auth) - Priority
```
Email: superadmin@example.com
Password: [Supabase Auth Password]
Expected: Login successful, role = SUPER_ADMIN, source = 'supabase_auth'
Note: Checked FIRST
```

### Test Case 2: Admin Login (Database) - Fallback
```
Email: admin@example.com
Password: admin123
Expected: Login successful, role = ADMIN, source = 'admin'
Note: Checked if not found in Supabase Auth
```

### Test Case 3: Invalid Credentials
```
Email: invalid@example.com
Password: wrongpassword
Expected: Error message "Invalid email or password"
```

### Test Case 4: Moderator Login
```
Email: moderator@example.com
Password: mod123
Expected: Login successful, role = MODERATOR, source = 'admin'
```

---

## Database Schema

### Admins Table
```sql
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('ADMIN', 'SUPERADMIN', 'MODERATOR')),
  custom_role VARCHAR(100),
  permissions JSONB,
  two_factor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Supabase Authentication
- Managed by Supabase Auth service
- Users created via Supabase Dashboard or API
- Metadata can store additional user information

---

## Error Handling

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid email or password" | Credentials don't match any source | Verify email and password |
| "Admin authentication failed" | Database query error | Check database connection |
| "Supabase authentication failed" | Supabase Auth error | Verify Supabase configuration |
| "An unexpected error occurred" | Unhandled exception | Check console logs |

---

## Configuration

### Environment Variables

Ensure these are set in your `.env` file:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Future Enhancements

### Planned Features

1. **Password Hashing**
   - Implement bcrypt for secure password storage
   - Add password strength validation

2. **JWT Tokens**
   - Replace base64 encoding with proper JWT
   - Add token expiration and refresh mechanism

3. **Two-Factor Authentication**
   - Implement TOTP-based 2FA
   - Support for authenticator apps

4. **OAuth Integration**
   - Google Sign-In
   - Microsoft Azure AD

5. **Session Management**
   - Multiple device tracking
   - Force logout from all devices

6. **Audit Logging**
   - Comprehensive login attempt logging
   - Failed login tracking and alerts

---

## Support & Troubleshooting

### Common Issues

**Issue:** Login fails for Super Admin
- **Check:** Verify user exists in Supabase Authentication
- **Check:** Confirm Supabase credentials in `.env`

**Issue:** Login fails for Admin
- **Check:** Verify user exists in `admins` table
- **Check:** Confirm password matches `password_hash` field

**Issue:** Redirect not working
- **Check:** Verify `UserRole` enum values match
- **Check:** Ensure navigation routes are configured

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Dual-source authentication implementation
- ✅ Role-based access control
- ✅ Enhanced login UI with security indicators
- ✅ Activity logging for admin logins
- ✅ Session management
- ✅ Logout from both sources

---

## Contributors

This authentication system was designed to provide secure, flexible authentication while maintaining backward compatibility with existing admin accounts.

For questions or issues, please refer to the project documentation or contact the development team.
