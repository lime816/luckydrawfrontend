# Authentication Flow - Visual Guide

## 🔐 Login Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTERS CREDENTIALS                   │
│                   (Email + Password)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AuthService.login(email, password)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  STEP 1: Check Supabase Auth │
         │  (Authentication/Users)       │
         └─────────────┬─────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    ✅ FOUND                    ❌ NOT FOUND
    & VALID                     or INVALID
         │                           │
         │                           ▼
         │              ┌─────────────────────────────┐
         │              │  STEP 2: Check Admins Table │
         │              │  (Database/Tables/Admins)   │
         │              └─────────────┬───────────────┘
         │                            │
         │              ┌─────────────┴─────────────┐
         │              │                           │
         │              ▼                           ▼
         │         ✅ FOUND                    ❌ NOT FOUND
         │         & VALID                     or INVALID
         │              │                           │
         ▼              ▼                           ▼
    ┌────────────────────────────┐      ┌──────────────────┐
    │  LOGIN SUCCESS             │      │  LOGIN FAILED    │
    │  (Super Admin)             │      │                  │
    │  Source: supabase_auth     │      │  Show Error:     │
    │  Role: SUPER_ADMIN         │      │  "Invalid email  │
    │  Dashboard: Super Admin    │      │   or password"   │
    └────────────┬───────────────┘      └──────────────────┘
                 │
                 │  ┌────────────────────────────┐
                 └─▶│  LOGIN SUCCESS             │
                    │  (Admin/Moderator)         │
                    │  Source: admin             │
                    │  Role: ADMIN/MODERATOR     │
                    │  Dashboard: Admin Panel    │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │  Store User in Auth Store  │
                    │  Generate Session Token    │
                    │  Show Success Toast        │
                    │  Redirect to Dashboard     │
                    └────────────────────────────┘
```

---

## 📊 Authentication Priority

### Priority Order:

1. **🥇 FIRST CHECK: Supabase Authentication**
   - Path: `Authentication/Users`
   - For: Super Admin
   - Method: `supabase.auth.signInWithPassword()`
   - Token: Supabase session token

2. **🥈 SECOND CHECK: Database Admins Table**
   - Path: `Database/Tables/Admins`
   - For: Admin, Moderator
   - Method: Direct database query
   - Token: Base64 encoded custom token

---

## 🎯 User Roles & Sources

| Role | Source | Authentication Path | Dashboard |
|------|--------|---------------------|-----------|
| **Super Admin** | Supabase Auth | `Authentication/Users` | Super Admin Dashboard |
| **Admin** | Database | `Database/Tables/Admins` | Admin Panel |
| **Moderator** | Database | `Database/Tables/Admins` | Moderator Panel |

---

## 🔄 Complete Authentication Workflow

### Step-by-Step Process:

#### 1️⃣ **User Submits Login Form**
```typescript
handleSubmit(email, password)
  ↓
setLoading(true)
setError('')
```

#### 2️⃣ **Call Authentication Service**
```typescript
const authResponse = await AuthService.login(email, password)
```

#### 3️⃣ **Check Supabase Authentication First**
```typescript
// Inside AuthService.login()
const supabaseAuth = await authenticateFromSupabaseAuth(email, password)

if (supabaseAuth.success) {
  return {
    success: true,
    user: { ...userDetails, role: SUPER_ADMIN },
    token: supabaseSessionToken,
    source: 'supabase_auth'
  }
}
```

#### 4️⃣ **If Not Found, Check Admins Table**
```typescript
const adminAuth = await authenticateFromAdminsTable(email, password)

if (adminAuth.success) {
  // Update last login
  await AdminService.updateLastLogin(admin.admin_id)
  
  // Log activity
  await AdminService.logActivity(admin.admin_id, 'LOGIN', ...)
  
  return {
    success: true,
    user: { ...userDetails, role: ADMIN/MODERATOR },
    token: customToken,
    source: 'admin'
  }
}
```

#### 5️⃣ **Handle Response**
```typescript
if (authResponse.success) {
  // Store in auth store
  login(authResponse.user, authResponse.token)
  
  // Show success message
  toast.success(`Welcome back, ${user.name}!`)
  
  // Redirect based on role and source
  const path = AuthService.getRedirectPath(user.role, authResponse.source)
  navigate(path)
} else {
  // Show error
  setError(authResponse.error)
}
```

---

## 🛡️ Security Features

### ✅ Implemented:
- ✓ Dual-source authentication
- ✓ Role-based access control
- ✓ Session token management
- ✓ Activity logging (for database admins)
- ✓ Last login tracking
- ✓ Error handling with user-friendly messages

### ⚠️ Production Requirements:
- ⚠️ **Password Hashing**: Implement bcrypt/argon2
- ⚠️ **JWT Tokens**: Replace base64 with proper JWT
- ⚠️ **Rate Limiting**: Prevent brute force attacks
- ⚠️ **2FA**: Implement two-factor authentication
- ⚠️ **HTTPS**: Enforce secure connections

---

## 🧪 Testing Examples

### Example 1: Super Admin Login
```javascript
// Input
email: "superadmin@luckydraw.com"
password: "SecurePass123!"

// Process
1. Check Supabase Auth → FOUND ✅
2. Authenticate → SUCCESS ✅
3. Role: SUPER_ADMIN
4. Source: supabase_auth
5. Redirect: /dashboard (Super Admin)

// Console Output
✅ Authenticated via Authentication as Super Admin
```

### Example 2: Regular Admin Login
```javascript
// Input
email: "admin@luckydraw.com"
password: "admin123"

// Process
1. Check Supabase Auth → NOT FOUND ❌
2. Check Admins Table → FOUND ✅
3. Authenticate → SUCCESS ✅
4. Role: ADMIN
5. Source: admin
6. Redirect: /dashboard (Admin Panel)

// Console Output
✅ Authenticated via Database as Admin
```

### Example 3: Invalid Credentials
```javascript
// Input
email: "invalid@example.com"
password: "wrongpass"

// Process
1. Check Supabase Auth → NOT FOUND ❌
2. Check Admins Table → NOT FOUND ❌
3. Return Error

// UI Output
❌ Invalid email or password
```

---

## 📱 UI Feedback

### Success Messages:
- **Super Admin**: "Welcome back, [Name]! (Super Admin)" 👑
- **Admin**: "Welcome back, [Name]! (Admin)" 🎉
- **Moderator**: "Welcome back, [Name]! (Moderator)" 🎉

### Error Messages:
- "Invalid email or password" (credentials don't match)
- "An unexpected error occurred" (system error)

### Info Banner:
> 🛡️ **Secure Authentication**
> 
> Super Admin credentials verified via Authentication. Other admins verified via Database.

---

## 🔧 Configuration

### Required Environment Variables:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Database Schema:
```sql
-- Admins Table
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('ADMIN', 'SUPERADMIN', 'MODERATOR')),
  two_factor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

---

## 📞 Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify Supabase configuration
3. Confirm database connectivity
4. Review user credentials in both sources

---

**Last Updated**: October 13, 2025
**Version**: 2.0.0 (Reversed Priority)
