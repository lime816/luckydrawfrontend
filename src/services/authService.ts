import { supabase } from '../lib/supabase-db';
import { AdminService } from './adminService';
import { User, UserRole } from '../types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  source?: 'admin' | 'supabase_auth';
}

export class AuthService {
  /**
   * Authenticate user from both Supabase Authentication and Admins table
   * Checks Supabase Auth first for Super Admin, then falls back to Admins table
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Starting authentication for:', email);
      
      // First, try to authenticate from Supabase Authentication (for Super Admin)
      console.log('📍 Step 1: Checking Supabase Auth...');
      const supabaseAuth = await this.authenticateFromSupabaseAuth(email, password);
      if (supabaseAuth.success) {
        console.log('✅ Authenticated via Supabase Auth');
        return supabaseAuth;
      }
      console.log('❌ Not found in Supabase Auth, checking Admin table...');

      // If not found in Supabase Auth, try Admins table (for regular Admins/Moderators)
      console.log('📍 Step 2: Checking Admin Table...');
      const adminAuth = await this.authenticateFromAdminsTable(email, password);
      if (adminAuth.success) {
        console.log('✅ Authenticated via Admin Table');
        return adminAuth;
      }
      console.log('❌ Not found in Admin Table either');

      // If both fail, return error
      return {
        success: false,
        error: 'Invalid email or password',
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return {
        success: false,
        error: 'An error occurred during authentication',
      };
    }
  }

  /**
   * Authenticate from Admins table (for regular Admins and Moderators)
   */
  private static async authenticateFromAdminsTable(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      // Trim inputs to avoid whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      // Query the admins table
      const admin = await AdminService.getAdminByEmail(trimmedEmail);

      if (!admin) {
        console.log('❌ Admin not found in database for email:', trimmedEmail);
        return { success: false, error: 'User not found in admins table' };
      }

      console.log('✅ Admin found in database:', { email: admin.email, role: admin.role });
      console.log('🔐 Comparing passwords...');
      console.log('   - Stored password hash:', admin.password_hash);
      console.log('   - Provided password:', trimmedPassword);
      console.log('   - Match:', admin.password_hash === trimmedPassword);

      // Verify password (direct comparison for now, should use bcrypt in production)
      // NOTE: In production, implement proper password hashing with bcrypt
      if (admin.password_hash !== trimmedPassword) {
        console.log('❌ Password mismatch');
        return { success: false, error: 'Invalid password' };
      }

      console.log('✅ Password verified successfully');

      // Update last login
      await AdminService.updateLastLogin(admin.admin_id);

      // Log the login activity
      try {
        await AdminService.logActivity(
          admin.admin_id,
          'LOGIN',
          'admins',
          admin.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log login activity:', logError);
      }

      // Map admin role to UserRole enum
      const userRole = this.mapAdminRoleToUserRole(admin.role);

      // Create user object with permissions
      const user: User = {
        id: admin.admin_id.toString(),
        email: admin.email,
        name: admin.name,
        role: userRole,
        createdAt: admin.created_at,
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: admin.two_factor,
        permissions: admin.permissions || {},
        customRole: admin.custom_role || undefined,
      };

      // Generate token
      const token = btoa(`admin:${admin.admin_id}:${Date.now()}`);

      console.log('✅ Admin authentication successful:', {
        id: admin.admin_id,
        email: admin.email,
        role: userRole
      });

      return {
        success: true,
        user,
        token,
        source: 'admin',
      };
    } catch (error: any) {
      console.error('❌ Admin table authentication error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      return { 
        success: false, 
        error: `Admin authentication failed: ${error?.message || 'Unknown error'}` 
      };
    }
  }

  /**
   * Authenticate from Supabase Authentication (for Super Admin)
   */
  private static async authenticateFromSupabaseAuth(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      // Attempt to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return { success: false, error: 'Supabase authentication failed' };
      }

      // Get user metadata
      const supabaseUser = data.user;
      const metadata = supabaseUser.user_metadata || {};

      // Sync Super Admin to admins table (for visibility and tracking)
      try {
        await AdminService.syncSuperAdminFromAuth(
          supabaseUser.id,
          supabaseUser.email || email,
          metadata.name || metadata.full_name || 'Super Admin'
        );
      } catch (syncError) {
        console.warn('Failed to sync Super Admin to admins table:', syncError);
        // Continue authentication even if sync fails
      }

      // Create user object for Super Admin with full permissions
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || email,
        name: metadata.name || metadata.full_name || 'Super Admin',
        role: UserRole.SUPER_ADMIN,
        createdAt: supabaseUser.created_at,
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: false, // Can be enhanced based on Supabase MFA
        permissions: {
          dashboard: ['read', 'write', 'update'],
          contests: ['read', 'write', 'update'],
          participants: ['read', 'write', 'update'],
          draw: ['read', 'write', 'update'],
          winners: ['read', 'write', 'update'],
          communication: ['read', 'write', 'update'],
          analytics: ['read', 'write', 'update'],
          settings: ['read', 'write', 'update'],
          user_management: ['read', 'write', 'update'],
          admin_management: ['read', 'write', 'update'],
        },
      };

      // Use Supabase session token
      const token = data.session?.access_token || btoa(`supabase:${supabaseUser.id}:${Date.now()}`);

      return {
        success: true,
        user,
        token,
        source: 'supabase_auth',
      };
    } catch (error) {
      console.error('Supabase authentication error:', error);
      return { success: false, error: 'Supabase authentication failed' };
    }
  }

  /**
   * Map database admin role to UserRole enum
   */
  private static mapAdminRoleToUserRole(role: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR'): UserRole {
    switch (role) {
      case 'SUPERADMIN':
        return UserRole.SUPER_ADMIN;
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'MODERATOR':
        return UserRole.MODERATOR;
      default:
        return UserRole.MODERATOR;
    }
  }

  /**
   * Logout user from both sources
   */
  static async logout(): Promise<void> {
    try {
      // Sign out from Supabase Auth (if authenticated via Supabase)
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get redirect path based on user role and authentication source
   */
  static getRedirectPath(role: UserRole, source?: 'admin' | 'supabase_auth'): string {
    // Super Admin from Supabase Auth gets special dashboard
    if (role === UserRole.SUPER_ADMIN && source === 'supabase_auth') {
      return '/dashboard'; // Super Admin Dashboard
    }
    
    // All other users (Admin, Moderator, or Super Admin from DB) go to regular dashboard
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return '/dashboard'; // Admin Dashboard
      case UserRole.MODERATOR:
        return '/dashboard'; // Moderator Dashboard
      default:
        return '/dashboard';
    }
  }

  /**
   * Verify if current session is valid
   */
  static async verifySession(token: string): Promise<boolean> {
    try {
      // Check if token is from Supabase
      if (token.startsWith('eyJ')) {
        const { data, error } = await supabase.auth.getUser(token);
        return !error && !!data.user;
      }

      // For admin tokens, decode and verify
      const decoded = atob(token);
      const [source, id] = decoded.split(':');
      
      if (source === 'admin') {
        const admin = await AdminService.getAdminById(parseInt(id));
        return !!admin;
      }

      return false;
    } catch (error) {
      console.error('Session verification error:', error);
      return false;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    source: 'admin' | 'supabase_auth'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (source === 'admin') {
        // Update password in admins table
        const adminId = parseInt(userId);
        const admin = await AdminService.getAdminById(adminId);
        
        if (!admin) {
          return { success: false, error: 'Admin not found' };
        }

        // Verify current password
        if (admin.password_hash !== currentPassword) {
          return { success: false, error: 'Current password is incorrect' };
        }

        // Update password (should be hashed in production)
        await AdminService.updateAdmin(adminId, {
          password_hash: newPassword,
        });

        return { success: true };
      } else {
        // Update password in Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
}
