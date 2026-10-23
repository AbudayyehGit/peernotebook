/**
 * Peer Notebook - Multi-Agency & Provider Profile Selector
 * GA #8 Production Standards • Unified Modern Gold Standard Component
 * Standardized across all viewport dimensions (mobile, tablet, desktop, iframe previews).
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, UserCircle2, ChevronDown, Check, ShieldCheck, X } from 'lucide-react';

export const OrgSelect: React.FC = () => {
  const { currentOrg, currentUser, allOrgs, allUsers, switchOrg, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userInitial = currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U';
  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'User';
  const roleLabel = currentUser?.role ? currentUser.role.replace('_', ' ') : 'Specialist';
  const orgShortName = currentOrg?.name ? currentOrg.name.split(' ')[0] : 'Agency';

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Standardized Unified Provider & Agency Button for ALL Viewports */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 border border-slate-300 rounded-full text-xs text-slate-800 transition-all shrink-0 cursor-pointer shadow-2xs group"
        title={`Active: ${currentUser?.fullName} (${currentOrg?.name})`}
      >
        {/* Avatar initial bubble */}
        <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs ring-1 ring-white/50">
          {userInitial}
        </div>

        {/* Cohesive text stack: compact on smallest viewports */}
        <div className="text-left min-w-0">
          <div className="flex items-center gap-1 leading-tight">
            <span className="font-bold text-slate-900 truncate max-w-[65px] sm:max-w-[100px] text-xs">
              <span className="xs:hidden">{firstName.slice(0, 5)}</span>
              <span className="hidden xs:inline">{firstName}</span>
            </span>
            <span className="hidden md:inline text-[10px] text-slate-500 font-medium">
              ({roleLabel})
            </span>
          </div>
          <div className="hidden xs:block text-[10px] text-[#0F766E] font-medium leading-tight truncate max-w-[75px] sm:max-w-[120px]">
            {orgShortName}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
      </button>

      {/* Unified Provider & Agency Popover / Modal with Explicit High Z-Index Stack */}
      {isOpen && (
        <>
          {/* Crisp Backdrop Overlay (z-50) */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container: modal on small screens (top-20 for clearance), anchored popover on larger screens */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-3 top-20 sm:top-auto sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] p-4 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 text-xs z-[60] animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E3A8A]">Provider & Agency Settings</h3>
                  <p className="text-[10px] text-slate-500">Multi-tenant CalAIM switching & RBAC roles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Agency Selection Section */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Select Agency (Tenant)</span>
                <span className="text-[10px] text-[#16A34A] flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> CalAIM BAA Valid
                </span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                {allOrgs.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => switchOrg(org.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-200 text-[#0F766E] font-semibold'
                          : 'hover:bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate text-xs">{org.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          NPI: {org.npi} · {org.countyCode}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0F766E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. User / Specialist Role Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Role / Provider Profile</span>
                <span className="text-[10px] font-mono text-slate-400">RBAC Secured</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                {allUsers.map((user) => {
                  const isSelected = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        switchUser(user.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between min-h-[44px] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A] font-semibold'
                          : 'hover:bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate text-xs">{user.fullName}</div>
                        <div className="text-[10px] text-[#0F766E] font-medium capitalize">
                          {user.role.replace('_', ' ')} · {user.credentialTitle}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#1E3A8A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm / Close Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
