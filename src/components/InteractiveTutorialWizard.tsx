/**
 * Peer Notebook - Interactive Tutorial Wizard Component
 * Exports InteractiveTutorialWizard and InteractiveSandboxTutorial
 * GA #8 Standard • Medi-Cal CalAIM (H0038 / POS 15) & CalMHSA Compliant
 */

import React from 'react';
import { InteractiveSandboxTutorial, InteractiveSandboxTutorialProps } from './InteractiveSandboxTutorial';

export { InteractiveSandboxTutorial };
export type { InteractiveSandboxTutorialProps };

export interface InteractiveTutorialWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const InteractiveTutorialWizard: React.FC<InteractiveTutorialWizardProps> = (props) => {
  return <InteractiveSandboxTutorial {...props} />;
};

export default InteractiveTutorialWizard;
