/**
 * Peer Notebook - Accessible Keyboard Focus & Screen Reader Management
 * Engineering Standard: H. Joe Abudayyeh Systems Production Standards
 * Conforms to WCAG 2.1 AA & Section 508 Accessibility Requirements
 *
 * Provides:
 * - createFocusTrap: Traps keyboard tab focus inside active dialogs/modals
 * - useFocusTrap: React Hook managing focus trap lifecycle, tab-cycling, and Escape dismiss
 * - announceToScreenReader: Injects status announcements into aria-live regions
 * - getModalAriaProps: Standardized ARIA dialog attributes
 *
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null;
  onEscape?: () => void;
  returnFocus?: boolean;
}

export interface FocusTrapInstance {
  activate: () => void;
  deactivate: () => void;
}

/**
 * Creates an imperative focus trap for an arbitrary container element.
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): FocusTrapInstance {
  let previousActiveElement: HTMLElement | null = null;
  let active = false;

  const getFocusableElements = (): HTMLElement[] => {
    const list = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return list.filter((el) => {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!active) return;

    if (e.key === 'Escape' && options.onEscape) {
      e.preventDefault();
      e.stopPropagation();
      options.onEscape();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const activate = () => {
    if (active) return;
    active = true;
    previousActiveElement = document.activeElement as HTMLElement | null;

    document.addEventListener('keydown', handleKeyDown, true);

    // Initial focus
    const focusTarget = options.initialFocus || getFocusableElements()[0] || container;
    if (focusTarget && typeof focusTarget.focus === 'function') {
      setTimeout(() => {
        focusTarget.focus();
      }, 20);
    }
  };

  const deactivate = () => {
    if (!active) return;
    active = false;
    document.removeEventListener('keydown', handleKeyDown, true);

    if (options.returnFocus !== false && previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };

  return { activate, deactivate };
}

/**
 * React Hook managing accessible modal dialog focus traps.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  onEscape?: () => void
) {
  const containerRef = useRef<T | null>(null);
  const trapRef = useRef<FocusTrapInstance | null>(null);

  const memoizedOnEscape = useCallback(() => {
    if (onEscape) onEscape();
  }, [onEscape]);

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      if (trapRef.current) {
        trapRef.current.deactivate();
        trapRef.current = null;
      }
      return;
    }

    const trap = createFocusTrap(containerRef.current, {
      onEscape: memoizedOnEscape,
      returnFocus: true
    });
    trap.activate();
    trapRef.current = trap;

    return () => {
      trap.deactivate();
      trapRef.current = null;
    };
  }, [isActive, memoizedOnEscape]);

  return containerRef;
}

/**
 * Global persistent Screen Reader Announcer using ARIA live regions.
 * Dispatches announcements without disrupting visual layout.
 */
let politeLiveRegion: HTMLElement | null = null;
let assertiveLiveRegion: HTMLElement | null = null;

function getOrCreateLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
  const id = `pn-sr-announcer-${priority}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    // Visually hidden styles conforming to Tailwind .sr-only
    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.padding = '0';
    el.style.margin = '-1px';
    el.style.overflow = 'hidden';
    el.style.clip = 'rect(0, 0, 0, 0)';
    el.style.whiteSpace = 'nowrap';
    el.style.border = '0';
    document.body.appendChild(el);
  }
  return el;
}

export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  const region = priority === 'assertive'
    ? (assertiveLiveRegion || (assertiveLiveRegion = getOrCreateLiveRegion('assertive')))
    : (politeLiveRegion || (politeLiveRegion = getOrCreateLiveRegion('polite')));

  // Clear text briefly to re-trigger assistive tech on repeated messages
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 50);
}

/**
 * Returns standard accessibility attributes for modal dialogs.
 */
export function getModalAriaProps(titleId: string, descriptionId?: string) {
  return {
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': titleId,
    ...(descriptionId ? { 'aria-describedby': descriptionId } : {})
  };
}
