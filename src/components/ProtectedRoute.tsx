/**
 * Peer Notebook - Protected Route / RBAC Guard
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
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto my-12 text-slate-300">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Authentication Required</h3>
        <p className="text-sm mt-1 text-slate-400">Please select an active provider or specialist profile to access clinical records.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-amber-900/50 rounded-xl max-w-md mx-auto my-12 text-slate-300">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">RBAC Access Restricted</h3>
        <p className="text-sm mt-1 text-slate-400">
          Your current profile (<span className="font-semibold text-amber-300">{role}</span>) does not have authorization for this clinical section.
        </p>
        <p className="text-xs mt-3 text-slate-500">Required: {allowedRoles.join(', ')}</p>
      </div>
    );
  }

  return <>{children}</>;
};
