/**
 * Peer Notebook - Dynamic Header Component
 * Engineering Standard: H. Joe Abudayyeh Systems Production Standards
 * Conforms to GA #8 Production Standard • Symmetrical Layout • Min-h-[48px] Tap Targets
 * Mounts Dynamic Compliance Badge, Offline Sync Status, and Accessible Navigation
 *
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import React from 'react';
import { Navbar, NavbarProps } from './Navbar';
import { ComplianceBadge } from './ComplianceBadge';

export interface HeaderProps extends NavbarProps {
  showComplianceBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <Navbar {...props} />;
};

export { ComplianceBadge };
export default Header;
