/**
 * Peer Notebook - Protected Route / RBAC Guard (Trauma-Informed Light Theme)
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../db/peerNotebookDatabase';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12 text-slate-700 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-[#D97706] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1E3A8A]">Provider Authentication Required</h3>
        <p className="text-xs mt-1 text-slate-500">
          Please select an active certified peer support specialist or supervisor profile to access clinical records.
        </p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center bg-white border border-amber-200 rounded-2xl max-w-md mx-auto my-12 text-slate-700 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-[#D97706] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1E3A8A]">Role Access Restricted</h3>
        <p className="text-xs mt-1 text-slate-600">
          Your current profile (<span className="font-semibold text-[#1E3A8A]">{role}</span>) does not have authorization for this clinical section.
        </p>
        <p className="text-[11px] mt-3 text-slate-400">Required: {allowedRoles.join(', ')}</p>
      </div>
    );
  }

  return <>{children}</>;
};
