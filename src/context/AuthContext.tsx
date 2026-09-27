import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { store } from '../services/storageStore';
import { auditService } from '../services/auditService';
import { supabase, isConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password?: string, roleOverride?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchUserRole: (role: UserRole) => void;
  isSuperAdmin: boolean;
  isAdminYayasan: boolean;
  isAdminUnit: boolean;
  isHR: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canManageMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial user from Supabase or storageStore
    const initAuth = async () => {
      try {
        if (isConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile from supabase or fallback
            const currentUser = store.getCurrentUser() || {
              id: session.user.id,
              email: session.user.email || 'admin@alquraniyyah.sch.id',
              full_name: session.user.user_metadata?.full_name || 'Admin SIMKA',
              role: (session.user.user_metadata?.role as UserRole) || 'super_admin',
              is_active: true,
              created_at: new Date().toISOString()
            };
            setUser(currentUser);
            store.setCurrentUser(currentUser);
          } else {
            const saved = store.getCurrentUser();
            setUser(saved);
          }
        } else {
          const saved = store.getCurrentUser();
          setUser(saved);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(store.getCurrentUser());
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string, roleOverride?: UserRole) => {
    setIsLoading(true);
    try {
      if (isConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const loggedInUser: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: roleOverride || (data.user.user_metadata?.role as UserRole) || 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        };
        setUser(loggedInUser);
        store.setCurrentUser(loggedInUser);
        await auditService.log('LOGIN', 'auth', loggedInUser.id, { email });
        return;
      }

      // Mock / Offline Auth Mode
      const allUsers = store.getUsers();
      let matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matched) {
        matched = {
          id: `usr-${Date.now()}`,
          email,
          full_name: email.split('@')[0].toUpperCase(),
          role: roleOverride || 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        };
      } else if (roleOverride) {
        matched = { ...matched, role: roleOverride };
      }

      setUser(matched);
      store.setCurrentUser(matched);
      await auditService.log('LOGIN', 'auth', matched.id, { email, role: matched.role });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      await auditService.log('LOGOUT', 'auth', user.id);
    }
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout:', e);
      }
    }
    setUser(null);
    store.setCurrentUser(null);
  };

  const switchUserRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserProfile = { ...user, role: newRole };
    setUser(updated);
    store.setCurrentUser(updated);
  };

  const role: UserRole = user?.role || 'viewer';
  const isSuperAdmin = role === 'super_admin';
  const isAdminYayasan = role === 'admin_yayasan';
  const isAdminUnit = role === 'admin_unit';
  const isHR = role === 'hr_kepegawaian';
  const isViewer = role === 'viewer';

  const canEdit = isSuperAdmin || isAdminYayasan || isHR || isAdminUnit;
  const canManageMaster = isSuperAdmin || isAdminYayasan;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        logout,
        switchUserRole,
        isSuperAdmin,
        isAdminYayasan,
        isAdminUnit,
        isHR,
        isViewer,
        canEdit,
        canManageMaster
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
