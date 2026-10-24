/**
 * Peer Notebook - Protected Route / RBAC Guard (Trauma-Informed Gold Standard)
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../db/peerNotebookDatabase';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return (
      <main className="w-full max-w-md mx-auto my-12 px-4" aria-labelledby="auth-required-title">
        <Card className="rounded-xl border border-slate-200/80 shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-8 gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 id="auth-required-title" className="text-lg font-semibold text-slate-900 tracking-tight">
                Provider Authentication Required
              </h2>
              <p className="text-sm font-normal text-slate-500">
                Please select an active certified peer support specialist or supervisor profile to access clinical records.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <main className="w-full max-w-md mx-auto my-12 px-4" aria-labelledby="role-restricted-title">
        <Card className="rounded-xl border border-amber-200/80 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-8 gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 id="role-restricted-title" className="text-lg font-semibold text-slate-900 tracking-tight">
                Role Access Restricted
              </h2>
              <p className="text-sm font-normal text-slate-600">
                Your current profile (<span className="font-semibold text-slate-900">{role}</span>) does not have authorization for this clinical section.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Required: {allowedRoles.join(', ')}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
};
