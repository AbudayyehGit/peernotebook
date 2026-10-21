/**
 * Peer Notebook - Multi-Agency & User Profile Selector
 * GA #8 Production Standards • Mobile-First Responsive Dropdown (44px min-h)
 * Provides unified mobile picker on small viewports (<640px) to prevent title collision.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, UserCircle2, ChevronDown, Check, ShieldCheck, X } from 'lucide-react';

export const OrgSelect: React.FC = () => {
  const { currentOrg, currentUser, allOrgs, allUsers, switchOrg, switchUser } = useAuth();
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* ========================================================================= */}
      {/* MOBILE TRIGGER (<640px): Unified 44px Chip Button */}
      {/* ========================================================================= */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileModalOpen(true)}
          className="min-h-[44px] flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200/90 border border-slate-300 rounded-xl text-xs text-slate-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
          title={`Active: ${currentUser?.fullName} (${currentOrg?.name})`}
        >
          <div className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            {currentUser?.fullName ? currentUser.fullName.charAt(0) : 'U'}
          </div>
          <span className="font-bold text-slate-900 max-w-[55px] truncate text-xs">
            {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'User'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>

        {/* Mobile Combined Modal */}
        {isMobileModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
            onClick={() => setIsMobileModalOpen(false)}
          >
            <div
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-4 shadow-2xl relative my-auto space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-50 text-[#0F766E] rounded-lg border border-teal-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E3A8A]">Provider & Agency Settings</h3>
                    <p className="text-[10px] text-slate-500">Multi-tenant CalAIM switching</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
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
                <div className="space-y-1">
                  {allOrgs.map((org) => {
                    const isSelected = org.id === currentOrg?.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          switchOrg(org.id);
                        }}
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
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Switch Provider Profile
                </div>
                <div className="space-y-1">
                  {allUsers.map((user) => {
                    const isSelected = user.id === currentUser?.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          switchUser(user.id);
                          setIsMobileModalOpen(false);
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="w-full py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP / TABLET CONTROLS (>=640px): Dual Independent Dropdowns */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Agency Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsOrgOpen(!isOrgOpen);
              setIsUserOpen(false);
            }}
            className="min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-slate-100 hover:bg-slate-200/90 border border-slate-300 rounded-xl text-xs text-slate-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title={currentOrg?.name}
          >
            <Building2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span className="max-w-[110px] lg:max-w-[140px] truncate font-bold text-slate-900 text-xs">
              {currentOrg?.name ? currentOrg.name.split(' ')[0] : 'Agency'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {isOrgOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOrgOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                        type="button"
                        onClick={() => {
                          switchOrg(org.id);
                          setIsOrgOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between min-h-[40px] cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 border border-teal-200 text-[#0F766E] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-900 truncate">{org.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            NPI: {org.npi} · {org.countyCode}
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
            type="button"
            onClick={() => {
              setIsUserOpen(!isUserOpen);
              setIsOrgOpen(false);
            }}
            className="min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-slate-100 hover:bg-slate-200/90 border border-slate-300 rounded-xl text-xs text-slate-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title={currentUser?.fullName}
          >
            <UserCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <div className="text-left min-w-0">
              <span className="font-bold text-slate-900 max-w-[100px] lg:max-w-[130px] truncate block leading-tight text-xs">
                {currentUser?.fullName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#0F766E] font-medium capitalize leading-tight truncate block">
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {isUserOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-1">
                  Switch Role / Provider Profile (RBAC)
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allUsers.map((user) => {
                    const isSelected = user.id === currentUser?.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          switchUser(user.id);
                          setIsUserOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between min-h-[40px] cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A] font-semibold'
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
    </div>
  );
};
