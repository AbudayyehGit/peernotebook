/**
 * Peer Notebook - Multi-Agency & User Profile Selector
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, UserCircle2, ChevronDown, Check, ShieldCheck } from 'lucide-react';

export const OrgSelect: React.FC = () => {
  const { currentOrg, currentUser, allOrgs, allUsers, switchOrg, switchUser } = useAuth();
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Agency Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsOrgOpen(!isOrgOpen);
            setIsUserOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs text-slate-200 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="max-w-[150px] truncate font-medium">
            {currentOrg?.name || 'Select Agency'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isOrgOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Behavioral Health Agency</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> BAA Valid
              </span>
            </div>
            <div className="space-y-1 mt-1">
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
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{org.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        NPI: {org.npi} • {org.medicaidProviderId}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User / Role Dropdown for rapid testing */}
      <div className="relative">
        <button
          onClick={() => {
            setIsUserOpen(!isUserOpen);
            setIsOrgOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs text-slate-200 transition-colors"
        >
          <UserCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <div className="text-left">
            <span className="font-medium text-white max-w-[130px] truncate block leading-tight">
              {currentUser?.fullName.split(',')[0]}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono capitalize block leading-tight">
              {currentUser?.role.replace('_', ' ')}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isUserOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Provider Profile (RBAC)
            </div>
            <div className="space-y-1 mt-1">
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
                        ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-200'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{user.fullName}</div>
                      <div className="text-[10px] text-emerald-400 font-medium capitalize mt-0.5">
                        {user.role.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {user.credentialTitle}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
