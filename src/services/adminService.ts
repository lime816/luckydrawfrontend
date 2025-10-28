import { supabase } from '../lib/supabase-db';

// Type definitions for Admin
export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR';
  custom_role?: string | null;
  permissions?: PagePermissions | null;
  two_factor: boolean;
  created_at: string;
  last_login?: string | null;
  is_super_admin?: boolean; // Flag to identify Super Admin from Supabase Auth
  supabase_user_id?: string | null; // Link to Supabase Auth user
}

export interface PagePermissions {
  dashboard?: PermissionLevel[];
  contests?: PermissionLevel[];
  participants?: PermissionLevel[];
  draw?: PermissionLevel[];
  winners?: PermissionLevel[];
  communication?: PermissionLevel[];
  analytics?: PermissionLevel[];
  settings?: PermissionLevel[];
  user_management?: PermissionLevel[];
  admin_management?: PermissionLevel[];
}

export type PermissionLevel = 'read' | 'write' | 'update';

export interface AdminActivityLog {
  log_id: number;
  admin_id: number;
  action: string;
  target_table: string;
  target_id?: number | null;
  session_id?: string | null;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  timestamp: string;
}

export class AdminService {
  // Create a new admin
  static async createAdmin(data: Omit<Admin, 'admin_id' | 'created_at'>): Promise<Admin> {
    const { data: admin, error } = await supabase
      .from('admins')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return admin;
  }

  // Get admin by email
  static async getAdminByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Get admin by ID
  static async getAdminById(id: number): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Update admin
  static async updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('admin_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update last login
  static async updateLastLogin(id: number): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('admin_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all admins (excludes Super Admin for non-super users)
  static async getAllAdmins(includeSuperAdmin: boolean = false): Promise<Admin[]> {
    let query = supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter out Super Admin unless explicitly requested
    if (!includeSuperAdmin) {
      query = query.eq('is_super_admin', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Get only Super Admin (for Super Admin dashboard)
  static async getSuperAdmin(): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('is_super_admin', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Log admin activity
  static async logActivity(
    adminId: number,
    action: string,
    targetTable: string,
    targetId?: number,
    sessionId?: string,
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS'
  ): Promise<AdminActivityLog> {
    // Prefer server-side log insertion via backend (service role). If backend is not reachable,
    // fall back to client-side Supabase insert (may fail due to RLS).
    try {
      const backendUrl = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001') + '/api/admins/log';
      const resp = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId, action, target_table: targetTable, target_id: targetId, session_id: sessionId, status })
      });

      if (resp.ok) {
        const payload = await resp.json();
        if (payload.success) return payload.log as AdminActivityLog;
        console.warn('Backend log API returned success=false:', payload.error || payload);
      } else {
        const txt = await resp.text().catch(() => '');
        console.warn('Backend log API responded with non-ok status, falling back to client insert:', resp.status, txt);
      }
    } catch (e) {
      console.warn('Could not call backend log API, falling back to Supabase client insert:', e);
    }

    // Fallback: attempt client-side insert (may be blocked by RLS)
    const { data, error } = await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        session_id: sessionId,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get admin activity logs
  static async getAdminActivityLogs(
    adminId?: number,
    limit: number = 50
  ): Promise<AdminActivityLog[]> {
    let query = supabase
      .from('admin_activity_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Check admin permissions
  static async checkAdminPermissions(
    adminId: number,
    requiredRole: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR'
  ): Promise<boolean> {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('role')
      .eq('admin_id', adminId)
      .single();

    if (error || !admin) return false;

    // Role hierarchy: SUPERADMIN > ADMIN > MODERATOR
    const roleHierarchy: Record<string, number> = {
      SUPERADMIN: 3,
      ADMIN: 2,
      MODERATOR: 1,
    };

    return (roleHierarchy[admin.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  }

  // Delete admin
  static async deleteAdmin(id: number): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_id', id);

    if (error) throw error;
  }

  // Get admin role statistics (excludes Super Admin from counts)
  static async getAdminRoleStats(includeSuperAdmin: boolean = false) {
    const filters = includeSuperAdmin ? {} : { is_super_admin: false };
    
    const [superAdmins, admins, moderators] = await Promise.all([
      supabase.from('admins').select('admin_id', { count: 'exact', head: true })
        .eq('role', 'SUPERADMIN')
        .match(filters),
      supabase.from('admins').select('admin_id', { count: 'exact', head: true })
        .eq('role', 'ADMIN')
        .match(filters),
      supabase.from('admins').select('admin_id', { count: 'exact', head: true })
        .eq('role', 'MODERATOR')
        .match(filters),
    ]);

    return {
      superAdmins: superAdmins.count || 0,
      admins: admins.count || 0,
      moderators: moderators.count || 0,
      total: (superAdmins.count || 0) + (admins.count || 0) + (moderators.count || 0),
    };
  }

  // Get admin statistics
  static async getAdminStats(adminId: number) {
    const [contests, draws, messages, activities] = await Promise.all([
      supabase.from('contests').select('contest_id', { count: 'exact', head: true }).eq('created_by', adminId),
      supabase.from('draws').select('draw_id', { count: 'exact', head: true }).eq('executed_by', adminId),
      supabase.from('messages').select('message_id', { count: 'exact', head: true }).eq('sent_by', adminId),
      supabase.from('admin_activity_log').select('log_id', { count: 'exact', head: true }).eq('admin_id', adminId),
    ]);

    return {
      contestsCreated: contests.count || 0,
      drawsExecuted: draws.count || 0,
      messagesSent: messages.count || 0,
      activitiesLogged: activities.count || 0,
    };
  }

  // Update admin permissions
  static async updateAdminPermissions(
    adminId: number,
    permissions: PagePermissions
  ): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update({
        permissions: permissions,
      })
      .eq('admin_id', adminId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get admin permissions
  static async getAdminPermissions(adminId: number): Promise<PagePermissions> {
    const { data, error } = await supabase
      .from('admins')
      .select('permissions')
      .eq('admin_id', adminId)
      .single();

    if (error) throw error;
    
    return data.permissions || {};
  }

  // Check if admin has specific permission for a page
  static async hasPagePermission(
    adminId: number,
    page: keyof PagePermissions,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const admin = await this.getAdminById(adminId);
    if (!admin) return false;

    // Super admins have all permissions
    if (admin.role === 'SUPERADMIN' || admin.is_super_admin) return true;

    const permissions = admin.permissions || {};
    const pagePermissions = permissions[page] || [];

    // Check if the required permission is in the array
    return pagePermissions.includes(requiredLevel);
  }

  // Check if user is Super Admin (from Supabase Auth)
  static async isSuperAdmin(adminId: number): Promise<boolean> {
    const admin = await this.getAdminById(adminId);
    return admin?.is_super_admin === true;
  }

  // Sync Super Admin from Supabase Auth to admins table
  static async syncSuperAdminFromAuth(supabaseUserId: string, email: string, name: string): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .upsert({
        supabase_user_id: supabaseUserId,
        email,
        name,
        password_hash: 'supabase_auth', // Placeholder
        role: 'SUPERADMIN',
        is_super_admin: true,
        last_login: new Date().toISOString(),
      }, {
        onConflict: 'supabase_user_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
