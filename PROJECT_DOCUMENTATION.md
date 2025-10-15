# Lucky Draw Management System - Project Documentation

## Table of Contents
1. [Login Page](#1-login-page)
2. [Dashboard](#2-dashboard)
3. [Contest Management](#3-contest-management)
4. [Participant Management](#4-participant-management)
5. [Lucky Draw Execution](#5-lucky-draw-execution)
6. [Winner Management](#6-winner-management)
7. [Communication Module](#7-communication-module)
8. [Analytics & Reports](#8-analytics--reports)
9. [User & Role Management](#9-user--role-management)
10. [Admin Management](#10-admin-management)
11. [Settings](#11-settings)

---

## 1. Login Page

### Overview
The Login Page provides secure authentication for administrators using Supabase authentication with email and password credentials.

**Purpose:** Authenticate admin users and establish secure sessions for system access.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Authentication:** Supabase Auth (@supabase/supabase-js 2.58.0)
- **State Management:** Zustand 4.4.6
- **UI Components:** Lucide React, React Hot Toast
- **Styling:** Tailwind CSS

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `supabase.auth.signInWithPassword()` | Authenticates user with email and password |

### Functional Flow

1. User enters email and password
2. Form validation checks required fields
3. Credentials sent to Supabase Auth
4. On success: User data and session token stored in Zustand store
5. User redirected to `/dashboard`
6. On failure: Error message displayed

---

## 2. Dashboard

### Overview
Central hub for monitoring system statistics and activities with real-time insights through interactive charts.

**Purpose:** Provide administrators with comprehensive system overview and quick access to critical information.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Charts:** Chart.js 4.4.0, React-Chartjs-2 5.2.0
- **Database:** Supabase (PostgreSQL)
- **Date Handling:** date-fns 2.30.0

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `DatabaseService.getAllContests()` | Fetches all contests with prizes and participants |

### Functional Flow

1. Component loads and fetches contest data
2. Data transformed to calculate statistics (total contests, active, participants, winners)
3. Recent 5 contests extracted for display
4. Stat cards display key metrics with trend indicators
5. Line chart shows participation trend over 7 days
6. Recent contests list with status badges
7. Error handling with fallback to sample data

---

## 3. Contest Management

### Overview
Core module for creating, editing, and monitoring lucky draw contests with automatic status management and QR code generation.

**Purpose:** Enable full lifecycle management of contests including scheduling, prizes, and participant access.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS, Framer Motion 10.16.4
- **Database:** Supabase (PostgreSQL)
- **QR Code:** qrcode 1.5.4
- **Storage:** Supabase Storage

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `DatabaseService.getAllContests()` | Retrieves all contests |
| POST | `DatabaseService.createContest(payload)` | Creates new contest |
| PUT | `DatabaseService.updateContest(id, updates)` | Updates contest |
| DELETE | `DatabaseService.deleteContest(id)` | Deletes contest |
| GET | `DatabaseService.getPrizesByContest(contestId)` | Fetches prizes |
| POST | `DatabaseService.createPrize(prizeData)` | Adds prize |
| POST | `supabase.storage.upload()` | Uploads QR code |

### Functional Flow

1. System loads all contests with automatic status updates every 10 seconds
2. **Create Contest:** Admin fills form (name, theme, schedule, prizes) → validates → creates record → generates QR code → uploads to storage → creates prizes
3. **Status Management:** Automatic transitions based on time (DRAFT → UPCOMING → ONGOING → COMPLETED)
4. **QR Code:** Generated as 500x500px PNG, uploaded to Supabase Storage, URL stored in contest
5. **Edit/Delete:** Modal with pre-filled data for editing, confirmation for deletion with cascade delete
6. **Search & Filter:** Real-time filtering by name and status

---

## 4. Participant Management

### Overview
Handles registration, validation, and organization of contest participants with bulk import/export capabilities.

**Purpose:** Manage participant data, validate entries, prevent duplicates, and facilitate bulk operations.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Data Processing:** XLSX 0.18.5
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `DatabaseService.getParticipantsByContest(contestId)` | Fetches participants |
| POST | `DatabaseService.addParticipant(data)` | Adds participant |
| PUT | `DatabaseService.updateParticipantValidation(id, validated)` | Updates validation |
| GET | `DatabaseService.checkDuplicateParticipant(contestId, contact)` | Checks duplicates |

### Functional Flow

1. Display participants with statistics (Total, Valid, Invalid, Duplicates)
2. **Import:** Upload Excel/CSV → parse data → validate → check duplicates → add to database
3. **Export:** Generate Excel with all participant data → download
4. **Duplicate Detection:** Check email, phone, IP+Device combination → flag duplicates
5. **Validation:** Manual toggle for valid/invalid status, invalid excluded from draws
6. **Search & Filter:** By name/email/phone, validation status, and contest

---

## 5. Lucky Draw Execution

### Overview
Core feature for conducting random winner selection using cryptographically secure algorithms with live animations.

**Purpose:** Execute fair and transparent random draws with support for multiple winners and prize allocation.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Animations:** Framer Motion 10.16.4, React Confetti 6.4.0
- **Random:** Crypto.getRandomValues()
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `DatabaseService.getAllContests()` | Fetches contests |
| GET | `DatabaseService.getPrizesByContest(contestId)` | Gets prizes |
| GET | `DatabaseService.getValidatedParticipants(contestId)` | Gets eligible participants |
| POST | `DatabaseService.executeRandomDraw(contestId, adminId, count, prizeIds)` | Saves results |

### Functional Flow

1. Admin selects contest, prize, and winner count
2. Validation: contest selected, prize selected, participants exist, count ≤ participants
3. Confirmation modal displayed
4. **Draw Execution:** 3-second animation → cryptographic random selection → winners selected
5. **Winner Reveal:** Confetti animation (10 seconds) → winners displayed in animated cards
6. **Save Results:** Create draw record → create winner records with prize and status
7. **Re-Draw:** Clear results and perform new selection without saving

---

## 6. Winner Management

### Overview
Post-draw operations including notification, prize status tracking, and distribution management.

**Purpose:** Track winners through complete prize lifecycle from selection to delivery.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Animations:** Framer Motion 10.16.4
- **Database:** Supabase (PostgreSQL)
- **Export:** CSV generation

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `DatabaseService.getWinnersByContest(contestId)` | Fetches winners |
| PUT | `DatabaseService.updateWinnerNotification(winnerId, notified)` | Updates notification |
| PUT | `Winner.updatePrizeStatus(winnerId, status)` | Updates prize status |

### Functional Flow

1. Display winners with statistics by status
2. **Status Workflow:** PENDING → NOTIFIED → CLAIMED → DISPATCHED → DELIVERED
3. **Status Update:** Click button → confirmation modal → update database → record timestamp
4. **Send Notifications:** Individual or bulk via Email/SMS/WhatsApp → update status to NOTIFIED
5. **Export Report:** Generate CSV with winner details, prize info, and status
6. **Search & Filter:** By name/email/prize and status

---

## 7. Communication Module

### Overview
Multi-channel messaging system for participant communication via Email, SMS, and WhatsApp.

**Purpose:** Facilitate communication for updates, notifications, reminders, and announcements.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `MessageService.getAllMessages()` | Retrieves message history |
| GET | `SupabaseService.getAllContests()` | Fetches contests |
| GET | `MessageService.getMessageStats()` | Gets statistics |
| POST | `MessageService.sendMessage(data)` | Sends individual message |
| POST | `MessageService.sendBulkMessage(contestId, type, content, adminId)` | Sends bulk message |

### Functional Flow

1. **Statistics Dashboard:** Display total, email, SMS, WhatsApp counts
2. **Send Message:** Select type (Email/SMS/WhatsApp) → select contest → choose bulk or individual → enter content → send
3. **Bulk Messaging:** Checkbox enables bulk → sends to all participants in contest
4. **Message History:** Display all sent messages with type, recipient, content, timestamp
5. **Message Types:** Email (HTML support), SMS (160 char limit), WhatsApp (rich text)

---

## 8. Analytics & Reports

### Overview
Comprehensive insights through interactive charts and statistical visualizations with exportable reports.

**Purpose:** Analyze performance, track trends, monitor engagement, and generate reports.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Charts:** Chart.js 4.4.0, React-Chartjs-2 5.2.0
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `AnalyticsService.getAnalytics()` | Fetches analytics data |
| GET | `AnalyticsService.exportAnalytics()` | Generates CSV export |

### Functional Flow

1. Load analytics data on component mount
2. **Key Metrics:** Display contests, participants, prizes, draws with trend indicators
3. **Charts:** Line (participation trend), Bar (contest performance), Doughnut (prize distribution)
4. **Top Contests:** List top 5 by participant count
5. **Time Analysis:** Participation by time slots (Morning/Afternoon/Evening/Night)
6. **Prize Stats:** Claimed/Pending/Unclaimed percentages, average claim time
7. **Export:** Generate CSV with all analytics data

---

## 9. User & Role Management

### Overview
Administration of system users with role assignments and permission configuration.

**Purpose:** Manage admin users, assign roles, configure permissions, enable 2FA, monitor activities.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `AdminService.getAllAdmins()` | Retrieves all admins |
| GET | `AdminService.getAdminActivityLogs()` | Fetches activity logs |
| GET | `AdminService.getAdminRoleStats()` | Gets role statistics |
| POST | `AdminService.createAdmin(data)` | Creates admin |
| PUT | `AdminService.updateAdmin(id, updates)` | Updates admin |
| DELETE | `AdminService.deleteAdmin(id)` | Deletes admin |

### Functional Flow

1. Display admins with role badges, 2FA status, last login
2. **Statistics:** Total users, Super Admins, Admins, Moderators
3. **Create Admin:** Form with name, email, password, role, page permissions (Read/Write/Update), 2FA checkbox
4. **Page Permissions:** Dashboard, Contests, Participants, Draw, Winners, Communication, Analytics, Settings
5. **Edit/Delete:** Modal with pre-filled data, confirmation for deletion
6. **Activity Log:** Display all actions with admin, action type, target, status, timestamp
7. **Search:** Filter by name or email

---

## 10. Admin Management

### Overview
Advanced admin control with custom roles, permission matrices, account locking, and detailed activity tracking.

**Purpose:** Granular control over admin accounts with enhanced features and comprehensive monitoring.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `AdminService.getAllAdmins()` | Retrieves admins with stats |
| GET | `AdminService.getAdminByEmail(email)` | Checks uniqueness |
| POST | `AdminService.logActivity(...)` | Logs actions |
| All endpoints from User & Role Management | | |

### Functional Flow

1. **Enhanced Dashboard:** Summary cards with trends (Total Admins, Moderators, Active Users, 2FA Enabled)
2. **Tabs:** Users, Activity Log, Permission Matrix, Dashboard Access
3. **Users Tab:** Avatar, custom role support, permission count, lock/unlock functionality
4. **Custom Roles:** Event Manager, Data Analyst, Contest Moderator (stored in custom_role field)
5. **Activity Filtering:** By admin, action type, status, date range (Today/Week/Month/All)
6. **Account Locking:** Toggle lock status to disable/enable access
7. **Activity Icons:** Visual indicators for CREATE, UPDATE, DELETE, LOGIN, LOGOUT actions

---

## 11. Settings

### Overview
System configuration for notifications and security preferences.

**Purpose:** Configure system-wide settings for notifications and security policies.

### Technology Stack
- **Frontend:** React 18.2.0, TypeScript, Tailwind CSS
- **State Management:** React Hooks

### API Endpoints

No external API endpoints - settings stored locally and in database configuration tables.

### Functional Flow

1. **Tabs:** Notifications, Security
2. **Notifications Tab:** Toggle settings for:
   - Contest Created
   - Contest Ending Soon
   - Draw Completed
   - Winner Selected
   - Prize Dispatched
3. **Security Tab:** Configure:
   - Session Timeout (minutes)
   - Max Login Attempts
   - Password Expiry (days)
   - Require Two-Factor Authentication (checkbox)
4. **Save Changes:** Update database configuration, display success notification

---

## Database Schema

### Tables
- **admins:** Admin users with roles and 2FA
- **admin_activity_log:** Audit trail of all actions
- **contests:** Contest details with status and schedule
- **prizes:** Prize information linked to contests
- **participants:** Participant entries with validation
- **draws:** Draw execution records
- **winners:** Winner records with prize status
- **messages:** Communication history
- **forms:** Dynamic form definitions
- **form_responses:** Form submission data

### Key Relationships
- Contest → Prizes (one-to-many)
- Contest → Participants (one-to-many)
- Contest → Draws (one-to-many)
- Draw → Winners (one-to-many)
- Participant → Winners (one-to-many)
- Admin → Contests (one-to-many)
- Admin → Activity Logs (one-to-many)

---

## Security Features

1. **Authentication:** Supabase Auth with JWT tokens
2. **Authorization:** Role-based access control (SUPERADMIN, ADMIN, MODERATOR)
3. **Permissions:** Page-level permissions (Read, Write, Update)
4. **2FA:** Two-factor authentication support
5. **Audit Trail:** Complete logging of all administrative actions
6. **Session Management:** Configurable timeouts
7. **Password Security:** Hashing and expiry policies
8. **Cryptographic Random:** Secure winner selection using Crypto API

---

## Technology Summary

**Frontend Stack:**
- React 18.2.0, TypeScript 5.9.3, Tailwind CSS 3.3.5
- Chart.js 4.4.0, Framer Motion 10.16.4, Lucide React 0.294.0

**Backend & Database:**
- Supabase (PostgreSQL), Prisma 6.16.3
- Supabase Auth, Supabase Storage

**State & Data:**
- Zustand 4.4.6, React Hooks
- XLSX 0.18.5, date-fns 2.30.0

**UI & UX:**
- React Hot Toast 2.4.1, React Confetti 6.4.0
- QRCode 1.5.4, Axios 1.6.0

---

*This documentation provides a comprehensive overview of all modules in the Lucky Draw Management System suitable for project reports and technical documentation.*
