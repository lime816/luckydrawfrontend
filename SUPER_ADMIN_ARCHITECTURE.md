# Super Admin System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Lucky Draw Application                       │
│                                                                   │
│  ┌────────────────┐              ┌─────────────────┐            │
│  │  Super Admin   │              │  Regular Admin  │            │
│  │  (Supabase)    │              │  (DB Table)     │            │
│  └────────┬───────┘              └────────┬────────┘            │
│           │                               │                      │
│           ▼                               ▼                      │
│  ┌─────────────────────────────────────────────────┐            │
│  │         Authentication Service                   │            │
│  │  - Supabase Auth (Super Admin)                  │            │
│  │  - Database Auth (Regular Admins)               │            │
│  └─────────────────┬───────────────────────────────┘            │
│                    │                                             │
│                    ▼                                             │
│  ┌─────────────────────────────────────────────────┐            │
│  │              Admins Table                        │            │
│  │  - Super Admin (synced, hidden)                 │            │
│  │  - Regular Admins (visible)                     │            │
│  │  - RLS Policies (visibility control)            │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Super Admin Login

```
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │ Email + Password
       ▼
┌──────────────────────┐
│ AuthService.login()  │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ authenticateFromSupabaseAuth()     │
│ - Validate with Supabase Auth      │
│ - Get user metadata                │
└──────┬─────────────────────────────┘
       │ Success
       ▼
┌────────────────────────────────────┐
│ syncSuperAdminFromAuth()           │
│ - Upsert to admins table           │
│ - Set is_super_admin = true        │
│ - Link supabase_user_id            │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Create User Object                 │
│ - Role: SUPER_ADMIN                │
│ - Full permissions                 │
│ - Token: Supabase session          │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Redirect to Dashboard              │
│ - Full system access               │
└────────────────────────────────────┘
```

### Regular Admin Login

```
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │ Email + Password
       ▼
┌──────────────────────┐
│ AuthService.login()  │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ authenticateFromAdminsTable()      │
│ - Query admins table               │
│ - Verify password                  │
└──────┬─────────────────────────────┘
       │ Success
       ▼
┌────────────────────────────────────┐
│ Create User Object                 │
│ - Role: ADMIN or MODERATOR         │
│ - Limited permissions              │
│ - Token: Custom token              │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Redirect to Dashboard              │
│ - Limited access                   │
└────────────────────────────────────┘
```

## Visibility Control

### Query Flow for Regular Admin

```
Regular Admin requests admin list
         │
         ▼
┌─────────────────────────────────────┐
│ AdminService.getAllAdmins()         │
│ - includeSuperAdmin = false         │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Supabase Query                      │
│ SELECT * FROM admins                │
│ WHERE is_super_admin = false        │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ RLS Policy Check                    │
│ "Admins can view non-super admins"  │
│ - Filters is_super_admin = false    │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Return Results                      │
│ - Only regular admins               │
│ - Super Admin NOT included          │
└─────────────────────────────────────┘
```

### Query Flow for Super Admin

```
Super Admin requests admin list
         │
         ▼
┌─────────────────────────────────────┐
│ AdminService.getAllAdmins(true)     │
│ - includeSuperAdmin = true          │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Supabase Query                      │
│ SELECT * FROM admins                │
│ (no filter)                         │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ RLS Policy Check                    │
│ "Super Admin full access"           │
│ - Allows all records                │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Return Results                      │
│ - All admins                        │
│ - Including Super Admin             │
└─────────────────────────────────────┘
```

## Access Control Flow

### Protected Route Access

```
User navigates to /super-admin-dashboard
         │
         ▼
┌─────────────────────────────────────┐
│ SuperAdminGuard Component           │
│ - Check isAuthenticated             │
│ - Check user.role                   │
└─────────┬───────────────────────────┘
          │
          ├─── NOT Authenticated ───────┐
          │                             │
          │                             ▼
          │                    ┌────────────────┐
          │                    │ Redirect to    │
          │                    │ /login         │
          │                    └────────────────┘
          │
          ├─── NOT SUPER_ADMIN ─────────┐
          │                             │
          │                             ▼
          │                    ┌────────────────────┐
          │                    │ Show Access Denied │
          │                    │ - Warning icon     │
          │                    │ - User role        │
          │                    │ - 3s countdown     │
          │                    └────────┬───────────┘
          │                             │
          │                             ▼
          │                    ┌────────────────────┐
          │                    │ Redirect to        │
          │                    │ /dashboard         │
          │                    └────────────────────┘
          │
          └─── IS SUPER_ADMIN ──────────┐
                                        │
                                        ▼
                               ┌────────────────────┐
                               │ Allow Access       │
                               │ Render Children    │
                               └────────────────────┘
```

## Database Schema

### admins Table Structure

```
┌─────────────────────────────────────────────────────────┐
│                     admins                              │
├─────────────────────────────────────────────────────────┤
│ admin_id            SERIAL PRIMARY KEY                  │
│ name                VARCHAR(100) NOT NULL               │
│ email               VARCHAR(150) UNIQUE NOT NULL        │
│ password_hash       VARCHAR(255) NOT NULL               │
│ role                role_type DEFAULT 'ADMIN'           │
│ custom_role         VARCHAR(150)                        │
│ permissions         JSONB                               │
│ two_factor          BOOLEAN DEFAULT FALSE               │
│ created_at          TIMESTAMP DEFAULT NOW()             │
│ last_login          TIMESTAMP                           │
│ is_super_admin      BOOLEAN DEFAULT FALSE         ◄─────┤ NEW
│ supabase_user_id    UUID UNIQUE                   ◄─────┤ NEW
└─────────────────────────────────────────────────────────┘
```

### Trigger Flow

```
Supabase Auth User Created/Updated
         │
         ▼
┌─────────────────────────────────────┐
│ Trigger: on_auth_user_created       │
│ - Fires on INSERT/UPDATE            │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│ Function: sync_super_admin_to_admins│
│ - Check is_super_admin in metadata  │
└─────────┬───────────────────────────┘
          │
          ├─── is_super_admin = true ──┐
          │                            │
          │                            ▼
          │                   ┌────────────────────┐
          │                   │ UPSERT to admins   │
          │                   │ - supabase_user_id │
          │                   │ - is_super_admin   │
          │                   │ - role = SUPERADMIN│
          │                   └────────────────────┘
          │
          └─── is_super_admin = false ─┐
                                       │
                                       ▼
                              ┌────────────────────┐
                              │ No action          │
                              └────────────────────┘
```

## Row Level Security (RLS) Policies

### Policy Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                   RLS Policies                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Super Admin Full Access                            │
│     ┌─────────────────────────────────────┐            │
│     │ FOR ALL                             │            │
│     │ USING (is_current_user_super_admin())│           │
│     │ → Allows ALL operations             │            │
│     └─────────────────────────────────────┘            │
│                                                         │
│  2. Admins Can View Non-Super Admins                   │
│     ┌─────────────────────────────────────┐            │
│     │ FOR SELECT                          │            │
│     │ USING (is_super_admin = false)      │            │
│     │ → Hides Super Admin from lists      │            │
│     └─────────────────────────────────────┘            │
│                                                         │
│  3. Admins Can Update Themselves                       │
│     ┌─────────────────────────────────────┐            │
│     │ FOR UPDATE                          │            │
│     │ USING (admin_id = current_admin_id) │            │
│     │ → Self-service only                 │            │
│     └─────────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Policy Evaluation

```
Query: SELECT * FROM admins

┌─────────────────────────┐
│ Check User Role         │
└────────┬────────────────┘
         │
         ├─── Super Admin ────────┐
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │ Policy 1 applies │
         │              │ Return ALL rows  │
         │              └──────────────────┘
         │
         └─── Regular Admin ──────┐
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │ Policy 2 applies     │
                        │ Filter:              │
                        │ is_super_admin=false │
                        └──────────────────────┘
```

## Component Architecture

### SuperAdminGuard Component

```
┌─────────────────────────────────────────────────────────┐
│              SuperAdminGuard                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Props:                                                 │
│  - children: ReactNode                                  │
│  - redirectTo: string = '/dashboard'                    │
│  - showAccessDenied: boolean = true                     │
│                                                         │
│  State:                                                 │
│  - showDenied: boolean                                  │
│                                                         │
│  Logic:                                                 │
│  ┌─────────────────────────────────────┐               │
│  │ 1. Get user from auth store         │               │
│  │ 2. Check isAuthenticated            │               │
│  │ 3. Check role === SUPER_ADMIN       │               │
│  │ 4. If not, show Access Denied       │               │
│  │ 5. Auto-redirect after 3s           │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  Render:                                                │
│  - Not authenticated → Navigate to /login               │
│  - Not Super Admin → Access Denied Screen               │
│  - Is Super Admin → Render children                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Complete System Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              React Application                          │
│                                                         │
│  ┌────────────────┐         ┌──────────────────┐       │
│  │ Login Page     │────────▶│ AuthService      │       │
│  └────────────────┘         └────────┬─────────┘       │
│                                      │                  │
│  ┌────────────────┐                 │                  │
│  │ Admin Mgmt     │◀────────────────┤                  │
│  └────────────────┘                 │                  │
│                                      │                  │
│  ┌────────────────┐                 │                  │
│  │ SuperAdminGuard│◀────────────────┤                  │
│  └────────────────┘                 │                  │
│                                      │                  │
└──────────────────────────────────────┼──────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase                                   │
│                                                         │
│  ┌────────────────┐         ┌──────────────────┐       │
│  │ Auth Service   │────────▶│ auth.users       │       │
│  └────────────────┘         └────────┬─────────┘       │
│                                      │                  │
│                                      │ Trigger          │
│                                      ▼                  │
│  ┌────────────────┐         ┌──────────────────┐       │
│  │ RLS Policies   │────────▶│ admins table     │       │
│  └────────────────┘         └──────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: UI Protection                                 │
│  ┌─────────────────────────────────────┐               │
│  │ - SuperAdminGuard component         │               │
│  │ - Access Denied screen              │               │
│  │ - Route-level protection            │               │
│  └─────────────────────────────────────┘               │
│                    ▼                                    │
│  Layer 2: API Protection                                │
│  ┌─────────────────────────────────────┐               │
│  │ - Role checks in services           │               │
│  │ - Token validation                  │               │
│  │ - Permission checks                 │               │
│  └─────────────────────────────────────┘               │
│                    ▼                                    │
│  Layer 3: Database Protection                           │
│  ┌─────────────────────────────────────┐               │
│  │ - Row Level Security (RLS)          │               │
│  │ - Automatic query filtering         │               │
│  │ - Trigger-based sync                │               │
│  └─────────────────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

This architecture ensures:

1. **Separation of Concerns** - Super Admin uses Supabase Auth, regular admins use database
2. **Automatic Syncing** - Super Admin synced to admins table via triggers
3. **Complete Invisibility** - Multiple layers ensure Super Admin is hidden
4. **Strong Security** - RLS policies at database level, guards at application level
5. **Maintainability** - Clear separation and well-documented flows

The system is production-ready and follows security best practices.
