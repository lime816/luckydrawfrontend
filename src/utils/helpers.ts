import { format, formatDistance, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date | null | undefined, formatStr: string = 'PPP'): string => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'Not set';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting relative time:', date, error);
    return 'Invalid date';
  }
};

// Number formatting utilities
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// String utilities
export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// Random selection utilities
export const secureRandomSelection = <T>(array: T[], count: number = 1): T[] => {
  if (count >= array.length) return [...array];
  
  const selected: T[] = [];
  const available = [...array];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return selected;
};

// Export utilities
export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

// Color utilities for charts
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: '#9CA3AF',
    UPCOMING: '#3B82F6',
    ONGOING: '#10B981',
    COMPLETED: '#6366F1',
    CANCELLED: '#EF4444',
    PENDING: '#F59E0B',
    NOTIFIED: '#3B82F6',
    CLAIMED: '#8B5CF6',
    DISPATCHED: '#06B6D4',
    DELIVERED: '#10B981',
  };
  return colors[status] || '#6B7280';
};

// Duplicate detection
export const detectDuplicates = (participants: any[], key: string): string[] => {
  const seen = new Set();
  const duplicates = new Set<string>();
  
  participants.forEach(p => {
    const value = p[key];
    if (seen.has(value)) {
      duplicates.add(p.id);
    } else {
      seen.add(value);
    }
  });
  
  return Array.from(duplicates);
};

// Permission checking
export const hasPermission = (userRole: string, requiredRole: string[]): boolean => {
  const roleHierarchy: Record<string, number> = {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    MODERATOR: 1,
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.min(...requiredRole.map(r => roleHierarchy[r] || 0));
  
  return userLevel >= requiredLevel;
};
