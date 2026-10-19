/**
 * Peer Notebook - Multi-Agency & User Profile Selector
 * Mobile-First Responsive Dropdown
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, UserCircle2, ChevronDown, Check, ShieldCheck } from 'lucide-react';

export const OrgSelect: React.FC = () => {
  const { currentOrg, currentUser, allOrgs, allUsers, switchOrg, switchUser } = useAuth();
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* Agency Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsOrgOpen(!isOrgOpen);
            setIsUserOpen(false);
          }}
          className="flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg text-xs text-slate-800 transition-colors shrink-0"
          title={currentOrg?.name}
        >
          <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span className="max-w-[50px] xs:max-w-[85px] sm:max-w-[140px] truncate font-medium text-slate-900 text-[10px] xs:text-[11px] sm:text-xs">
            {currentOrg?.name ? currentOrg.name.split(' ')[0] : 'Agency'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        {isOrgOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/20 sm:hidden"
              onClick={() => setIsOrgOpen(false)}
            />
            <div className="fixed inset-x-3 top-16 sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span>Behavioral Health Agency</span>
                <span className="text-[10px] text-[#16A34A] flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> CalAIM BAA Valid
                </span>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allOrgs.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrg(org.id);
                        setIsOrgOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-200 text-[#0F766E]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 truncate">{org.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          NPI: {org.npi} • {org.countyCode}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* User / Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsUserOpen(!isUserOpen);
            setIsOrgOpen(false);
          }}
          className="flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg text-xs text-slate-800 transition-colors shrink-0"
          title={currentUser?.fullName}
        >
          <UserCircle2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
          <div className="text-left min-w-0">
            <span className="font-semibold text-slate-900 max-w-[50px] xs:max-w-[80px] sm:max-w-[120px] truncate block leading-tight text-[10px] xs:text-[11px] sm:text-xs">
              {currentUser?.fullName.split(' ')[0]}
            </span>
            <span className="hidden sm:block text-[10px] text-[#0F766E] font-medium capitalize leading-tight truncate">
              {currentUser?.role.replace('_', ' ')}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        {isUserOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/20 sm:hidden"
              onClick={() => setIsUserOpen(false)}
            />
            <div className="fixed inset-x-3 top-16 sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-1">
                Switch Role / Provider Profile (RBAC)
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allUsers.map((user) => {
                  const isSelected = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setIsUserOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 truncate">{user.fullName}</div>
                        <div className="text-[10px] text-[#0F766E] font-medium capitalize mt-0.5">
                          {user.role.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          {user.credentialTitle}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
