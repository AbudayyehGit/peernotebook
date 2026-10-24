/**
 * Peer Notebook - System Badges & Observability Panel
 * Exported alias & container for GA #8 engineering and runtime compliance badges
 * Mounts runtime: Zero-AI (Deterministic), CalAIM H0038, and Supabase RLS indicators
 */

import React from 'react';
import { GA8EngineeringStatusBadges } from './GA8EngineeringStatusBadges';
import { ZeroAiBadge } from './ZeroAiBadge';

export const SystemBadges: React.FC = () => {
  return (
    <div className="w-full">
      <GA8EngineeringStatusBadges />
    </div>
  );
};

export { ZeroAiBadge, GA8EngineeringStatusBadges };
export default SystemBadges;
